import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { HashService } from 'src/utils/hash.service';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private hashService: HashService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload, { expiresIn: '7d' }) };
  }
  async validatePassword(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username);

    if (user && this.hashService.compare(password, user)) {
      return user;
    }
    return null;
  }
}
