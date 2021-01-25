import 'reflect-metadata';
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
import { LOCAL_DEV_ROUTE, prod, SESSION_COOKIE } from './constants';
import { typeormConfig } from './typeormConfig';
import { createUserDataLoader, createUpvoteDataLoader } from './utils/dataloaders';

const main = async () => {
  // Auto run migrations
  const conn = await createConnection(typeormConfig);
  await conn.runMigrations();
  
  // Create Express app, to connect to Graphql
  const app = express();
  app.listen(4000, () => {
    console.log('Listening on port 4000');
  });

  // Redis store connection
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // Accept CORS on local requests
  const CORS_SETTINGS = {
    origin: LOCAL_DEV_ROUTE,
    credentials: true,
  };

  app.use(cors(CORS_SETTINGS));
  
  app.use(session({
    name: SESSION_COOKIE,
    // Disable touch reduces the number of requests to Redis
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    secret: 'my secret',
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
