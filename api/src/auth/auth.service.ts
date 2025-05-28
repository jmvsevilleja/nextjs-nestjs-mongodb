import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { CreateUserInput } from '../users/dto/create-user.input';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.usersService.validateUser(email, password);
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async signup(createUserInput: CreateUserInput) {
    const existingUser = await this.usersService.findOneByEmail(createUserInput.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const user = await this.usersService.create(createUserInput);
    
    return this.login(user);
  }

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;
    
    let user = await this.usersService.findOneByGoogleId(id);
    
    if (!user) {
      user = await this.usersService.findOneByEmail(email);
      
      if (user) {
        // Update existing user with Google info
        user.googleId = id;
        user.isGoogleAccount = true;
        await user.save();
      } else {
        // Create new user
        const createUserInput: CreateUserInput = {
          name: `${name.givenName} ${name.familyName}`,
          email,
          googleId: id,
          isGoogleAccount: true,
          profilePicture: photos[0]?.value,
        };
        
        user = await this.usersService.create(createUserInput);
      }
    }
    
    return user;
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new Error('No user from Google');
    }
    
    return this.login(req.user);
  }
}