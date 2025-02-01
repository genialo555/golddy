import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { TwoFactorService } from './services/two-factor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email,
      twoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorVerified: false
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    };
  }

  async generateTwoFactorCode(user: User): Promise<string> {
    return this.twoFactorService.generateTwoFactorCode(user);
  }

  async verifyTwoFactorCode(email: string, code: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const isValid = await this.twoFactorService.verifyTwoFactorCode(user, code);
    if (isValid) {
      // Update JWT with 2FA verification
      const payload = { 
        sub: user.id, 
        email: user.email,
        twoFactorEnabled: user.isTwoFactorEnabled,
        twoFactorVerified: true
      };
      return true;
    }
    return false;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async enableTwoFactor(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.twoFactorService.enableTwoFactor(user);
  }

  async disableTwoFactor(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.twoFactorService.disableTwoFactor(user);
  }

  async logout(userId: number): Promise<void> {
    // Optionally invalidate JWT token on the server side
    // This would require implementing a token blacklist
  }
}