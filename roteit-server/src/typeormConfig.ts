import { User } from './entities/User';
import { Post } from './entities/Post';
import { ConnectionOptions } from 'typeorm';

export const typeormConfig: ConnectionOptions = {
  type: 'postgres',
  database: 'roteit',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  synchronize: true,
  entities: [Post, User]
};
