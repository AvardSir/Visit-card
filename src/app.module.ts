import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLISODateTime } from '@nestjs/graphql';
import type { Request } from 'express';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: true,
      introspection: true,
      buildSchemaOptions: {
        scalarsMap: [{ type: Date, scalar: GraphQLISODateTime }],
      },
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    PrismaModule,
    ProfileModule,
  ],
})
export class AppModule {}