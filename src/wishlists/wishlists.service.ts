import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}
  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const { itemsId } = createWishlistDto;
    const items = itemsId.map((item): Wish | { id: number } => ({
      id: item,
    }));
    const wishList = new Wishlist();
    for (const key in createWishlistDto) {
      wishList[key] = createWishlistDto[key];
    }
    const user = await this.userRepository.findOneBy({ id: userId });
    const wishes = await this.wishRepository.find({
      where: items,
    });
    wishList.owner = user;
    wishList.items = wishes;
    return this.wishlistRepository.save(wishList);
  }

  getAllWishlists(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  async getWishListById(id: number): Promise<Wishlist> {
    const list = await this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id: id,
      },
    });
    return list;
  }
  async remove(id: number, userId: number): Promise<Wishlist> {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    return await this.wishlistRepository.remove(wishList);
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId,
  ): Promise<Wishlist> {
    const wishList = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    if (!wishList)
      throw new BadRequestException('такой коллекции не существует');
    if (wishList.owner.id !== userId) {
      throw new BadRequestException('Вы не можете изменять чужую коллекцию');
    }
    for (const key in updateWishlistDto) {
      if (key === 'itemsId') {
        const items = updateWishlistDto.itemsId.map(
          (item): Wish | { id: number } => ({
            id: item,
          }),
        );
        const wishes = await this.wishRepository.find({
          where: items,
        });
        wishList.items = wishes;
      } else {
        wishList[key] = updateWishlistDto[key];
      }
    }

    return this.wishlistRepository.save(wishList);
  }
}
