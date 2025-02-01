import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import * as admin from 'firebase-admin';
import * as speakeasy from 'speakeasy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async generateSecret(user: User): Promise<string> {
    const secret = speakeasy.generateSecret();
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);
    return secret.base32;
  }

  async generateTwoFactorCode(user: User): Promise<string> {
    if (!user.twoFactorSecret) {
      await this.generateSecret(user);
    }

    // Generate Firebase custom token
    const customToken = await admin.auth().createCustomToken(user.firebaseUid || user.id.toString());
    
    // Generate TOTP code
    const code = speakeasy.totp({
      secret: user.twoFactorSecret as string,
      encoding: 'base32',
      step: 300 // 5 minutes
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not configured');
    }

    // Send code via Firebase Authentication
    await admin.auth().generateEmailVerificationLink(user.email, {
      url: frontendUrl,
    });

    return code;
  }

  async verifyTwoFactorCode(user: User, code: string): Promise<boolean> {
    if (!user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      step: 300 // 5 minutes
    });
  }

  async enableTwoFactor(user: User): Promise<void> {
    user.isTwoFactorEnabled = true;
    if (!user.twoFactorSecret) {
      await this.generateSecret(user);
    }
    await this.userRepository.save(user);
  }

  async disableTwoFactor(user: User): Promise<void> {
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = '';
    await this.userRepository.save(user);
  }
}