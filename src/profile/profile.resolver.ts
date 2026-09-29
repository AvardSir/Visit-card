import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { Profile } from './models/profile.model';
import { ProfessionalLink } from './models/professional-link.model';
import { Skill } from './models/skill.model';
import { Experience } from './models/experience.model';
import { Achievement } from './models/achievement.model';
import { Project } from './models/project.model';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { name: 'profile' })
  getProfile(): Promise<Profile> {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [ProfessionalLink])
  links(@Parent() profile: Profile): ProfessionalLink[] {
    return profile.links;
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile): Skill[] {
    return profile.skills;
  }

  @ResolveField(() => [Experience])
  experiences(@Parent() profile: Profile): Experience[] {
    return profile.experiences;
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile): Project[] {
    return profile.projects;
  }
}

@Resolver(() => Experience)
export class ExperienceResolver {
  @ResolveField(() => [Achievement])
  achievements(@Parent() experience: Experience): Achievement[] {
    return experience.achievements;
  }
}