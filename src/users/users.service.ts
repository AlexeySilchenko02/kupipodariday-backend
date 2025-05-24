import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { Wish } from 'src/wishes/entities/wish.entity';
import { HashService } from 'src/utils/hash.service';
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
      delete newUser.password;
      return newUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException(
            'Пользователь с таким email или username существует',
          );
        }
      }
    }
  }

  async getWishesWithUsername(username: string): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
      relations: {
        wishes: true,
        offers: true,
      },
    });

    return user.wishes;
  }
  async findOne(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }
  async getWishes(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        wishes: true,
      },
    });
    return user.wishes;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.getHash(
        updateUserDto.password,
      );
    }

    await this.userRepository.update(id, updateUserDto);
    return user;
  }

  async findMany(str: string) {
    return await this.userRepository.find({
      where: [{ username: str }, { email: str }],
    });
  }
  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        password: true,
        username: true,
        about: true,
      },
      where: {
        username,
      },
    });
    return user;
  }
}
