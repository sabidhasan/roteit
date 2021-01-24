import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";
import { User } from './User';
import { Upvote } from './Upvote';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  postAuthor: User;

  @Field()
  @Column()
  text!: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  link?: string;

  // @Field(() => Upvote)
  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];
}
