import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { MainEntity } from 'src/utils/MainEntity';
import {
  IsUrl,
  Length,
  IsNumber,
  Min,
  IsPositive,
  IsDecimal,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Offer } from 'src/offers/entities/offer.entity';
@Entity()
export class Wish extends MainEntity {
  @Column({
    type: 'varchar',
    length: 250,
  })
  @Length(1, 250)
  name: string;

  @Column({
    type: 'text',
  })
  @IsUrl()
  link: string;

  @Column({
    type: 'text',
  })
  @IsUrl()
  image: string;

  @Column({
    type: 'numeric',
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(1)
  @Column({
    type: 'numeric',
    default: 0,
  })
  raised: number;

  @Column({
    type: 'varchar',
    length: 1024,
  })
  @Length(1, 1024)
  description: string;

  @Column({
    type: 'numeric',
    default: 0,
  })
  @IsDecimal()
  copied: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}
