import { ClientOpts } from "redis";

export const getRedisConfig = (): ClientOpts => {
  const redisURL = process.env.REDIS_URL;
  if (redisURL.match(/\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}[:]\d{1,5}/gi)) {
    // host and port provided
    return {
      host: redisURL.split(':')[0],
      port: Number(redisURL.split(':')[1]),
    };
  }

  // Pass redis configuration as URL
  return { url: process.env.REDIS_URL };
}