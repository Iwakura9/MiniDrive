import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(credentials: LoginDto) {
    const user = await this.users.findByUsername(credentials.username);
    if (!user || !(await this.users.verifyPassword(credentials.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return {
      accessToken: await this.jwt.signAsync({ id: user.id, username: user.username }),
      user: { id: user.id, username: user.username },
    };
  }
}
