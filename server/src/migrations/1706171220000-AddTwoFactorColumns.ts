import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwoFactorColumns1706171220000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add two_factor_secret column if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'two_factor_secret'
                ) THEN 
                    ALTER TABLE users 
                    ADD COLUMN two_factor_secret text;
                END IF;
            END $$;
        `);

        // Add is_two_factor_enabled column if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'is_two_factor_enabled'
                ) THEN 
                    ALTER TABLE users 
                    ADD COLUMN is_two_factor_enabled boolean DEFAULT false;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns if they exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'two_factor_secret'
                ) THEN 
                    ALTER TABLE users 
                    DROP COLUMN two_factor_secret;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'is_two_factor_enabled'
                ) THEN 
                    ALTER TABLE users 
                    DROP COLUMN is_two_factor_enabled;
                END IF;
            END $$;
        `);
    }
} 