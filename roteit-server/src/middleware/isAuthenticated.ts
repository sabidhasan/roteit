import { Context } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

export const isAuthenticated: MiddlewareFn<Context> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('Auth token missing');
  }
  
  return next();
};
