import { Field, InputType } from "type-graphql";

@InputType()
export class PostCreateDto {
  @Field()
  title: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  link: string;
}
