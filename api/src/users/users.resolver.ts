import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'me' })
  async getMe(@CurrentUser() user: any): Promise<User | null> {
    return this.usersService.findOneById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'user', nullable: true })
  async getUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<User | null> {
    return this.usersService.findOneById(id);
  }
}
