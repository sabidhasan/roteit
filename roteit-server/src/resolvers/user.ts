import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import validator from 'email-validator';
import { UserResponseDto, UserCredentialsDto, UserCreateDto } from '../dto/user.dto';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { PASSWORD_RESET_PREFIX, SALT_ROUNDS, SESSION_COOKIE } from '../constants';
import { User } from '../entities/User';
import { Context } from '../types';
import { passwordIsValid, validateCredentials } from '../utils/validateCredentials';
import { EmailService } from '../utils/emailService';

@Resolver(() => User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() rootUser: User, @Ctx() ctx: Context) {
    // Mask other users' emails
    if (rootUser.id !== ctx.req.session.userId) {
      return '';
    }
    
    return rootUser.email;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: Context) {
    // Check if there is a user id in session cookie
    if (!ctx.req.session.userId) {
      return null;
    }

    // Get user from cookie
    try {
      return await User.findOne(Number(ctx.req.session.userId));
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

    const user = User.create({ 
      username: username.toLowerCase(),
      password: hashedPassword,
      email,
    });

    try {
      await user.save();
    } catch (err) {
      if (err.detail?.includes('already exists') || err.code === '24505') {
        return { errors: [{ field: 'username', message: 'duplicate user detected' }] };
      }

      return {
        errors: [{ field: 'username', message: `other error ${err.detail}` }],
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
        user = await User.findOneOrFail({ where: { email: credentials.emailOrUsername.toLowerCase() } });
      } else {
        user = await User.findOneOrFail({ where: { username: credentials.emailOrUsername.toLowerCase() } });
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() ctx: Context,
  ) {
    // Check if user exists, and email is valid
    const user = await User.findOne({ where: { email } });
    if (!user || !validator.validate(email)) {
      return true;
    }

    const token = v4();
    // Token expiry for Redis
    const ONE_HOUR_IN_MS = 1000 * 60 * 60;
    ctx.redisClient.set(`${PASSWORD_RESET_PREFIX}${token}`, user.id.toString(), 'EX', ONE_HOUR_IN_MS);

    const message = `<a href="http://localhost:3000/reset-password/${token}">Reset your password</a>`;
    try {
      await EmailService.sendEmail(email, message);
    } catch (err) {
      console.error(`Could not send email for token ${message}`, err);
    }

    return true; 
  }

  @Mutation(() => UserResponseDto)
  async updatePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() ctx: Context
  ): Promise<UserResponseDto> {
    if (!passwordIsValid(newPassword)) {
      return { errors: [{ field: 'password', message: 'Password too short' }] };
    }

    // Check if token is valid, and if so get user
    let tokenValueFromRedis: string | null;
    const redisKey = `${PASSWORD_RESET_PREFIX}${token}`;

    try {
      tokenValueFromRedis = await new Promise((resolve, reject) => {
        ctx.redisClient.get(redisKey, (err, reply) => {
          // If error, reject promise, otherwise reply
          return err ? reject(err) : resolve(reply);
        });
      });
      
      if (!tokenValueFromRedis) throw new Error();
    } catch {
      // Token not valid
      return { errors: [{ field: 'token', message: 'Invalid or expired token' }] };
    }

    // Check if user exists
    const userId = Number(tokenValueFromRedis);
    const user = await User.findOne({ id: userId });
    if (!user) {
      return { errors: [{ field: 'password', message: 'Invalid user' }] };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.update({ id: userId }, { password: hashedPassword });

    // Delete key in Redis
    await new Promise((resolve) => {
      ctx.redisClient.del(redisKey, resolve);
    });

    // Log in user
    ctx.req.session.userId = user.id;
    return { user };
  }
}
