import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTanentSettingTable1768728566010 implements MigrationInterface {
    name = 'AddTanentSettingTable1768728566010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brand_setting" json NOT NULL, "system_setting" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, CONSTRAINT "PK_69225c0ca64bcbbf9af8a217043" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenant_settings"`);
    }

}
