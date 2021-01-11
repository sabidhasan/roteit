import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
  import microConfig from './mikro-orm.config';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { PostResolver } from './resolvers/post';
import { Context } from './types';

const main = async () => {
  // Auto run migrations
  const orm = await MikroORM.init(microConfig);
  const migrationsRan = await orm.getMigrator().up();
  console.log(`Ran ${migrationsRan.length} total migrations!`);

  // Create Express app, to connect to Graphql
  const app = express();
  app.listen(4000, () => {
    console.log('Listening on port 4000')
  });

  // GraphQL Apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false,
    }),
    context: (): Context => ({ em: orm.em }),
  });
  apolloServer.applyMiddleware({ app });
};

main();
