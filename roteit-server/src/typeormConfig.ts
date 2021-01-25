import { ConnectionOptions } from 'typeorm';
import path from 'path';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { Upvote } from './entities/Upvote';
import { prod } from './constants';

export const typeormConfig: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrations: [path.join(__dirname, './migrations/*')],
  // Synchronize will auto-sync DB schemas, which is bad in prod
  synchronize: !prod,
  logging: !prod,
  entities: [Post, User, Upvote],
};
