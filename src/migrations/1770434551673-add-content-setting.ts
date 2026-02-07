import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentSetting1770434551673 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_settings" ADD "content_strategy" json DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
