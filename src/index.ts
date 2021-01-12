import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import microConfig from './mikro-orm.config';
import { Context } from './types';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { prod } from './constants';

const main = async () => {
  // Auto run migrations
  const orm = await MikroORM.init(microConfig);
  const migrationsRan = await orm.getMigrator().up();
  console.log(`Ran ${migrationsRan.length} total migrations!`);

  // Create Express app, to connect to Graphql
  const app = express();
  app.listen(4000, () => {
    console.log('Listening on port 4000');
  });

  // Redis store connection
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(session({
    name: 'sid',
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
  }))

  // GraphQL Apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: true,
    }),
    context: ({ req, res }): Context => ({ em: orm.em, req, res }),
  });
  apolloServer.applyMiddleware({ app });
};

main();
