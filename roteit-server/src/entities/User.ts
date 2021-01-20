import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt = new Date();
  
  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field(() => String)
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Field(() => String)
  @Column({ unique: true })
  email!: string;
}
