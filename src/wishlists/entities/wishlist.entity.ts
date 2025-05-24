import { Entity, ManyToOne, Column, ManyToMany, JoinTable } from 'typeorm';
import { MainEntity } from 'src/utils/MainEntity';
import { User } from 'src/users/entities/user.entity';
import { IsString, IsUrl, Length } from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';
@Entity()
export class Wishlist extends MainEntity {
  @Column({
    type: 'varchar',
    length: 250,
  })
  @Length(1, 250)
  name: string;

  @Column({
    type: 'varchar',
    length: 1500,
    nullable: true,
  })
  @Length(1500)
  description: string;
  @IsUrl()
  @IsString()
  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}
