import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProfessionalLink } from './professional-link.model';
import { Skill } from './skill.model';
import { Experience } from './experience.model';
import { Project } from './project.model';

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => [ProfessionalLink])
  links!: ProfessionalLink[];

  @Field(() => [Skill])
  skills!: Skill[];

  @Field(() => [Experience])
  experiences!: Experience[];

  @Field(() => [Project])
  projects!: Project[];
}