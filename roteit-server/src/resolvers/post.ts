import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Context } from '../types';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { PostCreateDto } from '../dto/post.dto';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne({ id });
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
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ id });
    if (post && title) {
      await Post.update({ id }, { title });
      return post;
    }

    return null;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<Boolean> {
    try {
      await Post.delete({ id });
      return true;
    } catch {
      return false;
    }
  }
}
