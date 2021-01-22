import { Field, InputType, ObjectType } from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
export class PostCreateDto {
  @Field()
  title: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  link: string;
}


@ObjectType()
export class PostsPaginated {
  @Field(() => [Post])
  posts: Post[];

  @Field(() => Boolean)
  done: boolean;
}