import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import redis from 'redis';

export type Context = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
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
