import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFollowersHistoryColumns1737786886023 implements MigrationInterface {
    name = 'AddFollowersHistoryColumns1737786886023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add gained_count column with default 0
        await queryRunner.query(`
            ALTER TABLE "followers_history" 
            ADD COLUMN IF NOT EXISTS "gained_count" integer NOT NULL DEFAULT 0
        `);

        // Add lost_count column with default 0
        await queryRunner.query(`
            ALTER TABLE "followers_history" 
            ADD COLUMN IF NOT EXISTS "lost_count" integer NOT NULL DEFAULT 0
        `);

        // Add growth_rate column with default 0
        await queryRunner.query(`
            ALTER TABLE "followers_history" 
            ADD COLUMN IF NOT EXISTS "growth_rate" decimal(5,2) NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns in reverse order
        await queryRunner.query(`
            ALTER TABLE "followers_history" DROP COLUMN IF EXISTS "growth_rate"
        `);
        await queryRunner.query(`
            ALTER TABLE "followers_history" DROP COLUMN IF EXISTS "lost_count"
        `);
        await queryRunner.query(`
            ALTER TABLE "followers_history" DROP COLUMN IF EXISTS "gained_count"
        `);
    }
}
