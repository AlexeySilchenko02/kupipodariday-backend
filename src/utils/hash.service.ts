import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  getHash(password: string): Promise<string> {
    const hash = bcrypt.hash(password, 10);
    return hash;
  }

  compare(password: string, user: any): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
