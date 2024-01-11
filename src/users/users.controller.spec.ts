import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      findAll: () => {
        return Promise.resolve([...users]);
      },
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
      findOne: (id: number) => {
        const user = users.find((user) => user.id === id);
        if (!user) {
          throw new NotFoundException(); // Throw NotFoundException when user is not found
        }
        return Promise.resolve(user);
      },
      update: (id: number, updateUserDto: UpdateUserDto) => {
        const user = users.find((user) => user.id === id);
        Object.assign(user, updateUserDto);
        return Promise.resolve(user);
      },
      remove: (id: number) => {
        const index = users.findIndex((user) => user.id === id);
        users.splice(index, 1);
        return Promise.resolve(null);
      },
    };
    fakeAuthService = {
      signUp: (createUserDto: CreateUserDto) => {
        return fakeUsersService.create(createUserDto);
      },
      signIn: (createUserDto: CreateUserDto) => {
        return fakeUsersService
          .findByEmail(createUserDto.email)
          .then((users) => users[0]);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns a list of users', async () => {
    const user = await fakeUsersService.create({
      email: 'test@mail.com',
      password: 'qwerty',
    } as CreateUserDto);
    const users = await controller.findAll();
    expect(users.length).toEqual(1);
    expect(users[0].id).toEqual(user.id);
  });

  it('findUser throws an error if user with given id is not found', async () => {
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('findUser returns a single user with given id', async () => {
    const user = await fakeUsersService.create({
      email: 'test@mail.com',
      password: 'qwerty',
    } as CreateUserDto);
    const foundUser = await controller.findOne(user.id.toString());
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toEqual(user.id);
  });

  it('Signs up a user', async () => {
    const session = {};
    const user = await controller.create(
      {
        email: 'test@mail.com',
        password: 'qwerty',
      } as CreateUserDto,
      session,
    );
    expect(user).toBeDefined();
  });
  it('Signs in a user', async () => {
    const session = { userId: -1 };
    const user = await controller.create(
      {
        email: 'test@mail.com',
        password: 'qwerty',
      } as CreateUserDto,
      session,
    );
    expect(user).toBeDefined();
    expect(session.userId).toEqual(user.id);
  });
});
