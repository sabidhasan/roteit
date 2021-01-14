import bcrypt from 'bcrypt';
import { UserResponse, UserCredentials } from '../dto/user.dto';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { SALT_ROUNDS, SESSION_COOKIE } from '../constants';
import { User } from '../entities/User';
import { Context } from '../types';


@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: Context) {
    // Check if there is a user id in session cookie
    if (!ctx.req.session.userId) {
      return null;
    }

    // Get user from cookie
    try {
      return await ctx.em.findOne(User, { id: ctx.req.session.userId })
    } catch {
      return null;
    }
  }

  @Mutation(() => UserResponse)
  async register(
    @Ctx() ctx: Context,
    @Arg('input') credentials: UserCredentials,
  ): Promise<UserResponse> {
    const { username, password } = credentials;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = ctx.em.create(User, { username: username.toLowerCase(), password: hashedPassword });

    if (username.length <= 2) {
      return { errors: [{ field: 'username', message: 'username too short'}] };
    }

    if (password.length <= 3) {
      return { errors: [{ field: 'password', message: 'password too short' }] };
    }

    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.detail?.includes('already exists') || err.code === '24505') {
        return { errors: [{ field: 'username', message: 'duplicate user detected' }] };
      }

      return {
        errors: [
          { field: 'username', message: `other error ${err.detail}` },
          { field: 'password', message: `other error ${err.detail}` },
        ],
      };
    }

    // Set the cookie in express-session to start user session
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Ctx() ctx: Context,
    @Arg('input') credentials: UserCredentials,
  ): Promise<UserResponse> {
    let user: User;

    try {
      user = await ctx.em.findOneOrFail(User, { username: credentials.username.toLowerCase() });
    } catch {
      return {
        errors: [{ field: 'username', message: 'could not find user' }],
      };
    }

    if (!(await bcrypt.compare(credentials.password, user.password))) {
      return {
        errors: [{ field: 'password', message: 'invalid login' }],
      };
    }

    // Set the cookie in express-session to keep user session alive
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: Context) {
    return new Promise((resolve) => {
      ctx.req.session.destroy((err) => {
        ctx.res.clearCookie(SESSION_COOKIE);

        if (!err) {
          return resolve(true);
        }
        resolve(false);
      });
    });
  }
}
