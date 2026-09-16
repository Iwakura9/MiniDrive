import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Repository } from 'typeorm';
import { User } from './user.entity';

const scrypt = promisify(scryptCallback);

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const username = this.config.getOrThrow<string>('appUsername');
    const exists = await this.users.findOneBy({ username });
    if (!exists) {
      await this.users.save({
        username,
        passwordHash: await this.hashPassword(
          this.config.getOrThrow<string>('appPassword'),
        ),
      });
    }
  }

  findByUsername(username: string): Promise<User | null> {
    return this.users.findOneBy({ username });
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    const [salt, storedKey] = passwordHash.split(':');
    if (!salt || !storedKey) return false;
    const candidate = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(storedKey, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }
}
