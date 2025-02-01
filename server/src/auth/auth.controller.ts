import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorAuthGuard } from './guards/two-factor-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    isTwoFactorEnabled: boolean;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isTwoFactorEnabled) {
      await this.authService.generateTwoFactorCode(user);
      return {
        requiresTwoFactor: true,
        message: '2FA code has been sent to your email',
      };
    }

    return this.authService.login(user);
  }

  @Post('2fa/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify 2FA code' })
  async verifyTwoFactor(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    const isCodeValid = await this.authService.verifyTwoFactorCode(email, code);
    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const user = await this.authService.getUserByEmail(email);
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enable 2FA' })
  async enableTwoFactor(@Req() req: RequestWithUser) {
    return this.authService.enableTwoFactor(req.user.id);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard, TwoFactorAuthGuard)
  @ApiOperation({ summary: 'Disable 2FA' })
  async disableTwoFactor(@Req() req: RequestWithUser) {
    return this.authService.disableTwoFactor(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Req() req: RequestWithUser) {
    return this.authService.logout(req.user.id);
  }
}
