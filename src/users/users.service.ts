import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashService } from 'src/utils/hash.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hash = await this.hashService.getHash(password);

    try {
      const newUser = await this.userRepository.save({
        ...createUserDto,
        password: hash,
      });
      return plainToInstance(User, newUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username существует',
          );
        }
      }
      throw error;
    }
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return plainToInstance(User, user);
  }

  async getUserByUsername(
    username: string,
    withPassword = false,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!withPassword) {
      return plainToInstance(User, user);
    }

    return user;
  }

  async findMany(str: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: [{ username: ILike(`%${str}%`) }, { email: ILike(`%${str}%`) }],
    });
    return users.map((user) => plainToInstance(User, user));
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.getHash(
        updateUserDto.password,
      );
    }

    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOneBy({ id });
    return plainToInstance(User, updatedUser);
  }

  async getWishes(userId: number): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { wishes: true },
    });
    return user.wishes;
  }

  async getWishesWithUsername(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        wishes: true,
        offers: true,
      },
    });

    return user.wishes;
  }
}
