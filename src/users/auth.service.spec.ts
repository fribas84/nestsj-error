import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      findByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (createUserDto: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          ...createUserDto,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use', async () => {
    const fakeUser: CreateUserDto = {
      email: 'test@mail.com',
      password: 'qwerty',
    };
    await service.signUp(fakeUser);
    await expect(service.signUp(fakeUser)).rejects.toThrow(BadRequestException);
  });

  it('Throws an error if user signs in with an unused email', async () => {
    const fakeUser: CreateUserDto = {
      email: 'unused@mail.com',
      password: 'qwerty',
    };
    await expect(service.signIn(fakeUser)).rejects.toThrow(NotFoundException);
  });

  it('Throws an error if an invalid password is provided', async () => {
    const fakeUser: CreateUserDto = {
      email: 'real@mail.com',
      password: 'qwerty',
    };
    await service.signUp(fakeUser);
    fakeUser.password = 'invalid';
    await expect(service.signIn(fakeUser)).rejects.toThrow(BadRequestException);
  });
});
