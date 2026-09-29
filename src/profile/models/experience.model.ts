import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Achievement } from './achievement.model';

@ObjectType()
export class Experience {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field()
  position!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date, { nullable: true })
  endDate!: Date | null;

  @Field(() => [Achievement])
  achievements!: Achievement[];
}