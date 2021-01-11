import bcrypt from 'bcrypt';
import { UserResponse, UserCredentials } from '../dto/user.dto';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { SALT_ROUNDS } from '../constants';
import { User } from '../entities/User';
import { Context } from '../types';


@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Ctx() ctx: Context,
    @Arg('input') credentials: UserCredentials,
  ): Promise<UserResponse> {
    const { username, password } = credentials;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = ctx.em.create(User, { username: username.toLowerCase(), password: hashedPassword });
    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (err.detail.includes('') || err.code === '24505') {
        return {
          errors: [{ field: 'username', message: 'duplicate user detected' }],
        };
      }

      return {
        errors: [{ field: 'username', message: `other error ${err.detail}` }],
      };
    }
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

    return { user };
  }
}
