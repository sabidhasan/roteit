import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { prod } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
  dbName: 'lireddit',
  debug: !prod,
  type: 'postgresql',
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname + '/migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  }
} as Parameters<typeof MikroORM.init>[0];
