// src/user/user.service.ts

import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => 'USER_REPOSITORY'))
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.userRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      passwordHash: hashedPassword,
      socialNetwork: createUserDto.socialNetwork,
      bio: createUserDto.bio,
      profileImageUrl: createUserDto.profileImageUrl,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: {
        posts: true,
        collaborations: true,
        socialNetworks: true,
        notificationPreferences: true,
        affinityScores: true,
        kpiFinanciers: true,
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        posts: true,
        collaborations: true,
        socialNetworks: true,
        notificationPreferences: true,
        affinityScores: true,
        kpiFinanciers: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        posts: true,
        collaborations: true,
        socialNetworks: true,
        notificationPreferences: true,
        affinityScores: true,
        kpiFinanciers: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // If updating password, verify current password and hash new password
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new ConflictException('Current password is required to update password');
      }

      const isPasswordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new ConflictException('Current password is incorrect');
      }

      // Update password
      user.passwordHash = await bcrypt.hash(updateUserDto.newPassword, 10);
    }

    // Remove password-related fields from the update
    delete updateUserDto.currentPassword;
    delete updateUserDto.newPassword;

    // Update user fields
    Object.assign(user, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
