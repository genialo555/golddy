import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGrowthPredictionsTable1737786886026 implements MigrationInterface {
    name = 'CreateGrowthPredictionsTable1737786886026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "growth_predictions" (
                "id" SERIAL NOT NULL,
                "predicted_followers" integer NOT NULL,
                "growth_rate" float NOT NULL,
                "confidence_score" float NOT NULL,
                "factors" jsonb NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" integer,
                CONSTRAINT "pk_growth_predictions" PRIMARY KEY ("id"),
                CONSTRAINT "fk_growth_predictions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_growth_predictions_user_date" ON "growth_predictions" ("user_id", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_growth_predictions_user_date"`);
        await queryRunner.query(`DROP TABLE "growth_predictions"`);
    }
} 