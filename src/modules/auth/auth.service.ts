import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ email: dto.email, passwordHash });

    const accessToken = await this.signToken(user.id, user.email);
    return { accessToken, user: { id: user.id, email: user.email } };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signToken(user.id, user.email);
    return { accessToken, user: { id: user.id, email: user.email } };
  }

  private signToken(userId: string, email: string) {
    return this.jwtService.signAsync({ sub: userId, email });
  }
}