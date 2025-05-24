import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}
  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { itemId, amount } = createOfferDto;

    const user = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });
    const wish = await this.wishRepository.findOneBy({ id: itemId });
    if (!wish) throw new BadRequestException('Нет подарка с таким id');
    const whoseWish = user.wishes.some((item) => item.id === wish.id);
    if (!whoseWish) {
      const updatedSumm = Number(wish.raised) + amount;
      if (updatedSumm > wish.price) {
        throw new BadRequestException('Cумма превышает необходимую');
      }
      wish.raised = updatedSumm;
      await this.wishRepository.save(wish);
      return this.offerRepository.save({ ...createOfferDto, user, item: wish });
    }

    throw new BadRequestException(
      'Нельзя внести денежные средства на собственное пожелание',
    );
  }

  getAllOffers(): Promise<Offer[]> {
    return this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOneBy({ id });
  }
}
