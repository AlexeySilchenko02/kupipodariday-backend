import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashService } from 'src/utils/hash.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hash = await this.hashService.getHash(dto.password);

    try {
      const newUser = await this.userRepository.save({
        ...dto,
        password: hash,
      });

      return plainToInstance(User, newUser);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException(
          'Пользователь с таким email или username существует',
        );
      }
      throw error;
    }
  }

  async getUserByUsername(
    username: string,
    withPassword = false,
  ): Promise<User | null> {
    if (withPassword) {
      const user = await this.userRepository.findOne({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
          about: true,
          avatar: true,
          password: true,
        },
      });
      return user;
    }

    const user = await this.userRepository.findOne({ where: { username } });
    return plainToInstance(User, user);
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return plainToInstance(User, user);
  }

  async findMany(queryStr: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: [
        { username: ILike(`%${queryStr}%`) },
        { email: ILike(`%${queryStr}%`) },
      ],
    });
    return users.map((u) => plainToInstance(User, u));
  }

  /* ---------- обновление ---------- */

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const data: UpdateUserDto = { ...dto };

    if (dto.password) {
      data.password = await this.hashService.getHash(dto.password);
    }

    const { affected } = await this.userRepository.update(id, data);
    if (affected === 0) throw new NotFoundException('Пользователь не найден');

    const updated = await this.userRepository.findOne({ where: { id } });
    return plainToInstance(User, updated);
  }

  /* ---------- связи ---------- */

  async getWishes(id: number): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { wishes: true },
    });
    return user?.wishes ?? [];
  }

  async getWishesWithUsername(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { wishes: true, offers: true },
    });
    return user?.wishes ?? [];
  }
}
