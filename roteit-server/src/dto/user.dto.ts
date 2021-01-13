import { IsString } from 'class-validator';
import { InputType, Field, ObjectType } from 'type-graphql';
import { User } from '../entities/User';
import { FieldError } from './error.dto';

@InputType()
export class UserCredentials {
  @Field()
  username: string;

  @IsString()
  @Field()
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
