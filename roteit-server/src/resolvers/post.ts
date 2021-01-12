import { Post } from '../entities/Post';
import { Context } from '../types';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() ctx: Context): Promise<Post[]> {
    return ctx.em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('id', () => Int) id: number,
    @Ctx() ctx: Context,
  ): Promise<Post | null> {
    return ctx.em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() ctx: Context,
  ): Promise<Post> {
    const post = ctx.em.create(Post, { title });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() ctx: Context,
  ): Promise<Post | null> {
    const post = await ctx.em.findOne(Post, id);
    if (post) {
      post.title = title;
      await ctx.em.persistAndFlush(post);
      return post;
    }

    return null;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() ctx: Context
  ): Promise<Boolean> {
    try {
      ctx.em.nativeDelete(Post, { id });
      return true;
    } catch {
      return false;
    }
  }
}
