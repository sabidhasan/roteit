import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { Context } from './types';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { prod, SESSION_COOKIE } from './constants';
import { typeormConfig } from './typeormConfig';
import { getRedisConfig } from './redisConfig';
import { createUserDataLoader, createUpvoteDataLoader } from './utils/dataloaders';

const main = async () => {
  // Auto run migrations
  const conn = await createConnection(typeormConfig);
  await conn.runMigrations();
  
  // Create Express app, to connect to Graphql
  const app = express();
  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });

  // Redis store connection
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(getRedisConfig());

  // Accept CORS on requests, and set proxy in case prod environment needs it
  app.set('trust proxy', 1)
  const CORS_SETTINGS = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  };

  app.use(cors(CORS_SETTINGS));
  
  app.use(session({
    name: SESSION_COOKIE,
    // Disable touch reduces the number of requests to Redis
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // 10 years expiry
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      // HTTPS cookies only for prod environment, as localhost has no HTTPS by default
      secure: prod,
      // CSRF
      sameSite: 'lax',
    }
  }));

  // GraphQL Apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({
      req,
      res,
      redisClient,
      userLoader: createUserDataLoader(),
      upvoteLoader: createUpvoteDataLoader(),
    }),
  });
  apolloServer.applyMiddleware({
    app,
    // Inject CORS SETTINGS into Apollo route as well (not really needed, as CORS is global defiined, above)
    cors: CORS_SETTINGS,
  });
};

main().catch(console.error);
