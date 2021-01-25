import DataLoader from 'dataloader';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';

export const createUserDataLoader = () => new DataLoader<number, User>(async (userIds) => {
  const users = await User.findByIds(userIds as number[]);
  const userIdMap: { [k: number]: User } = {};
  users.forEach((u) => {
    userIdMap[u.id] = u;
  });
  return userIds.map((userId) => userIdMap[userId]);
});

export const createUpvoteDataLoader = () => new DataLoader<{ userId: number, postId: number}, Upvote | null>(async (keys) => {
  const upvotes = await Upvote.findByIds(keys as any);
  const upvoteIdMap: { [k: string]: Upvote } = {};
  upvotes.forEach((uv) => {
    upvoteIdMap[`${uv.userId}|${uv.postId}`] = uv;
  });

  return keys.map((k) => upvoteIdMap[`${k.userId}|${k.postId}`]);
});
