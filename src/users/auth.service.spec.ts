import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of user service
    fakeUsersService = {
      find: (email) => {
        const filteredUser = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUser);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
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

    authService = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(authService).toBeDefined();
  });

  it('creates a user with a salted and hashed password', async () => {
    const user = await authService.signup('isl@gmail.com', 'aslll');

    expect(user.password).not.toEqual('aslll');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user sign in with email that is in use', async () => {
    await authService.signup('asdf@asdf.com', 'asdf');
    await expect(authService.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw an error if user enter unused email', async () => {
    await expect(
      authService.signin('testNotFound@gmail.com', 'test123'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throw an error if invalid password', async () => {
    await authService.signup('test@gmail.com', 'mypass');

    await expect(
      authService.signin('test@gmail.com', 'mypass1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('sign in user with valid email and password', async () => {
    await authService.signup('test@gmail.com', 'mypass');
    const user = await authService.signin('test@gmail.com', 'mypass');
    expect(user).toBeDefined();
  });
});
