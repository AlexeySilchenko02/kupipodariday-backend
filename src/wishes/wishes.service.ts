import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createWishDto: CreateWishDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  getLastWishes(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  getTopWishes(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { copied: 'desc' },
      take: 20,
    });
  }

  async findOne(id: number): Promise<Wish> {
    const wish = this.wishRepository.findOne({
      relations: {
        offers: {
          user: true,
        },
        owner: true,
      },
      where: {
        id,
      },
    });
    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');
    return wish;
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      relations: {
        offers: true,
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');

    if (!wish.offers.length) {
      await this.wishRepository.update(id, updateWishDto);
      return this.findOne(id);
    }

    throw new BadRequestException(
      'Нельзя удалить или изменить, пользователи уже внесли денежные средства',
    );
  }

  async remove(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });

    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');
    try {
      return await this.wishRepository.remove(wish);
    } catch (err) {
      throw new ConflictException(
        'Нельзя удалить подарок, пользователи уже внесли денежные средства',
      );
    }
  }

  async copy(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOneBy({ id });
    if (!wish) throw new BadRequestException('Подарка с таким id не найдено');
    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });
    const newWish = this.wishRepository.create(wish);
    newWish.copied = 0;
    newWish.raised = 0;
    newWish.owner = user;
    wish.copied += 1;
    await this.wishRepository.save(wish);
    await this.wishRepository.insert(newWish);

    return newWish;
  }
}
