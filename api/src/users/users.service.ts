import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const { password, ...rest } = createUserInput;
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    
    const newUser = new this.userModel({
      ...rest,
      password: hashedPassword,
    });
    
    return newUser.save();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    return isPasswordValid ? user : null;
  }
}