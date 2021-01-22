import { Post } from '../entities/Post';
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Context } from '../types';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { PostCreateDto, PostsPaginated } from '../dto/post.dto';

@Resolver(() => Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() rootPost: Post): string {
    return rootPost.text.slice(1, 100);
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
      SELECT p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) "postAuthor"
      FROM post p
      LEFT JOIN "user" u ON u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ''}
      ORDER BY p."createdAt"
      LIMIT $1
    `, inputs);

    return {
      posts: posts.slice(0, requestedLimit),
      done: posts.length !== fetchLimit,
    };
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
