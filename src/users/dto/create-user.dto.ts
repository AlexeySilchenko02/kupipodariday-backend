import {
  IsString,
  Length,
  IsUrl,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  about: string;

  @IsUrl()
  @IsOptional()
  avatar: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}
