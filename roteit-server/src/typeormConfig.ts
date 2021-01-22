import { ConnectionOptions } from 'typeorm';
import path from 'path';
import { User } from './entities/User';
import { Post } from './entities/Post';

export const typeormConfig: ConnectionOptions = {
  type: 'postgres',
  database: 'roteit',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  migrations: [path.join(__dirname, './migrations/*')],
  synchronize: true,
  entities: [Post, User]
};
