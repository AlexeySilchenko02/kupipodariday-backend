import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async editProfile(@Req() req, @Body() body: UpdateUserDto): Promise<User> {
    return this.usersService.update(req.user.id, body);
  }

  @Get('me/wishes')
  async getCurrentUserWishes(@Req() req) {
    return this.usersService.getWishes(req.user.id);
  }

  @Post('find')
  async findMany(@Body('query') query: string): Promise<User[]> {
    return this.usersService.findMany(query);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':username/wishes')
  async getWishesWithUsername(@Param('username') username: string) {
    return this.usersService.getWishesWithUsername(username);
  }
}
