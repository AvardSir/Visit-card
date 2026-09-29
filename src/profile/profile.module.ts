import { Module } from '@nestjs/common';
import { ProfileResolver, ExperienceResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  providers: [ProfileResolver, ExperienceResolver, ProfileService],
})
export class ProfileModule {}