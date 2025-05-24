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
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  getCurrentUser(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }
  @Patch('me')
  editProfile(@Req() req, @Body() body) {
    return this.usersService.update(req.user.id, body);
  }
  @Get('me/wishes')
  getCurrentUserWishes(@Req() req) {
    return this.usersService.getWishes(req.user.id);
  }
  @Post('find')
  findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }
  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }
  @Get(':username/wishes')
  getWishesWithUsername(@Param('username') username: string) {
    return this.usersService.getWishesWithUsername(username);
  }
}
