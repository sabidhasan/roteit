import { Request, Response } from 'express';
import redis from 'redis';

export type Context = {
  req: Request,
  res: Response,
  redisClient: redis.RedisClient,
}

declare module "express-session" {
  interface Session {
    // extend session object in `Request` middleware
    userId: number;
  }
}
