import { MikroORM } from '@mikro-orm/core';
// import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';

const main = async () => {
  // Auto run migrations
  const orm = await MikroORM.init(microConfig);
  const migrationsRan = await orm.getMigrator().up();
  console.log(`Ran ${migrationsRan.length} total migrations!`);

  // Create Express app
  const app = express();
  app.listen(4000, () => {
    console.log('Listening on port 4000')
  });
};

main();
