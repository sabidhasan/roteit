import { Request, Response } from 'express';
import redis from 'redis';
import { createUpvoteDataLoader, createUserDataLoader } from './utils/dataloaders';

export type Context = {
  req: Request,
  res: Response,
  redisClient: redis.RedisClient,
  userLoader: ReturnType<typeof createUserDataLoader>
  upvoteLoader: ReturnType<typeof createUpvoteDataLoader>
}

declare module "express-session" {
  interface Session {
    // extend session object in `Request` middleware
    userId: number;
  }
}
