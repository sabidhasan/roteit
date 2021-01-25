import { Post } from '../entities/Post';
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Context } from '../types';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { PostCreateDto, PostsPaginated } from '../dto/post.dto';
import { Upvote } from '../entities/Upvote';
import { User } from '../entities/User';

@Resolver(() => Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() rootPost: Post): string {
    return rootPost.text.slice(0, 100);
  }

  @FieldResolver(() => User, { nullable: true })
  postAuthor(
    @Root() post: Post,
    @Ctx() ctx: Context,
  ): Promise<User | undefined> {
    return ctx.userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() ctx: Context,
  ): Promise<number | null> {
    const { userId } = ctx.req.session;
    if (!userId) {
      return null;
    }

    const upvote = await ctx.upvoteLoader.load({ userId, postId: post.id });
    return upvote?.value || null;
  }

  @Query(() => PostsPaginated)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { description: 'Cursor represents the datetime stamp for posts', nullable: true }) cursor: string | null,
  ): Promise<PostsPaginated> {
    const requestedLimit = (limit > 500 ? 500 : limit);
    const fetchLimit = requestedLimit + 1;

    const inputs: any[] = [fetchLimit];

    if (cursor) {
      inputs.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(`
      SELECT p.*
      FROM post p
      ${cursor ? `where p."createdAt" < $2` : ''}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `, inputs);

    return {
      posts: posts.slice(0, requestedLimit),
      done: posts.length !== fetchLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    try {
      return (await getConnection().query(`
      SELECT p.*
      FROM post p
      WHERE p.id = $1
      LIMIT 1;
    `, [id]))[0];
    } catch {
      return undefined;
    }
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuthenticated)
  async createPost(
    @Arg('input') post: PostCreateDto,
    @Ctx() ctx: Context,  
  ): Promise<Post> {
    return Post.create({
      ...post,
      creatorId: ctx.req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String) title: string,
    @Arg('text', () => String) text: string,
    @Ctx() ctx: Context,
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id AND "creatorId" = :creatorId', { id, creatorId: ctx.req.session.userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() ctx: Context
  ): Promise<Boolean> {
    const post = await Post.findOne(id);

    if (!post || post.creatorId !== ctx.req.session.userId) {
      throw new Error('Cannot find post or you do not have permission');
    }

    try {
      await Upvote.delete({ postId: id });
      await Post.delete({ id });
      return true;
    } catch  (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() ctx: Context,
  ) {
    const { userId } = ctx.req.session;
    const actualValue = value >= 0 ? 1 : -1;

    const existingUpvote = await Upvote.findOne({ where: { postId, userId }});

    if (existingUpvote && existingUpvote.value !== actualValue) {
      // User has voted but it was different than the vote now
      try {
        await getConnection().query(`
          START TRANSACTION;
          UPDATE upvote SET "value" = ${value} WHERE "postId" = ${postId} AND "userId" = ${userId};
          UPDATE "post" SET "points" = "points" + ${actualValue * 2} WHERE "post"."id" = ${postId};
          COMMIT;
        `);
        return true;
      } catch {
        return false;
      }
    } else if (!existingUpvote) {
      // First time voting
      try {
        await getConnection().query(`
        START TRANSACTION;
        INSERT INTO upvote ("userId", "postId", "value") VALUES (${userId}, ${postId}, ${actualValue});
        UPDATE "post" SET "points" = "points" + ${actualValue} WHERE "post"."id" = ${postId};
        COMMIT;
      `);
        return true;
      } catch {
        return false;
      }
    } else {
      // Existing upvote is the same as what user is voting
      return false;
    }
  }
}
