import bcrypt from 'bcrypt';
import validator from 'email-validator';
import { UserResponseDto, UserCredentialsDto, UserCreateDto } from '../dto/user.dto';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { SALT_ROUNDS, SESSION_COOKIE } from '../constants';
import { User } from '../entities/User';
import { Context } from '../types';
import { validateCredentials } from '../utils/validateCredentials';

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

  @Mutation(() => UserResponseDto)
  async register(
    @Ctx() ctx: Context,
    @Arg('input') credentials: UserCredentialsDto,
  ): Promise<UserResponseDto> {
    const errors = validateCredentials(credentials);
    if (errors) {
      return { errors };
    }

    const { username, password, email } = credentials;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = ctx.em.create(User, {
      username: username.toLowerCase(),
      password: hashedPassword,
      email,
    });


    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.detail?.includes('already exists') || err.code === '24505') {
        return { errors: [{ field: 'username', message: 'duplicate user detected' }] };
      }

      return {
        errors: [
          { field: 'username', message: `other error ${err.detail}` },
        ],
      };
    }

    // Set the cookie in express-session to start user session
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponseDto)
  async login(
    @Ctx() ctx: Context,
    @Arg('input') credentials: UserCreateDto,
  ): Promise<UserResponseDto> {
    let user: User;

    try {
      if (validator.validate(credentials.emailOrUsername)) {
        user = await ctx.em.findOneOrFail(User, { email: credentials.emailOrUsername.toLowerCase() });
      } else {
        user = await ctx.em.findOneOrFail(User, { username: credentials.emailOrUsername.toLowerCase() });
      }
    } catch {
      return { errors: [{ field: 'emailOrUsername', message: 'could not find user' }] };
    }

    if (!(await bcrypt.compare(credentials.password, user.password))) {
      return { errors: [{ field: 'password', message: 'invalid login' }] };
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
