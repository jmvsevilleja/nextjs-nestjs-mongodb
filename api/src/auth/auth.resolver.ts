import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './models/auth.model';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signup(@Args('input') createUserInput: CreateUserInput): Promise<AuthResponse> {
    return this.authService.signup(createUserInput);
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => AuthResponse)
  async login(
    @Args('input') loginInput: LoginInput,
    @CurrentUser() user: User,
  ): Promise<AuthResponse> {
    return this.authService.login(user);
  }
}