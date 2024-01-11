import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signUp(createUserDto: CreateUserDto) {
    const users = await this.userService.findByEmail(createUserDto.email);
    if (users.length) {
      throw new BadRequestException('User already exists');
    }
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    return this.userService.create({ ...createUserDto, password: hash });
  }

  async signIn(createUserDto: CreateUserDto) {
    const [user] = await this.userService.findByEmail(createUserDto.email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(createUserDto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }
}
