import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1611548470565 implements MigrationInterface {
    name = 'Initial1611548470565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "upvote" ("value" integer NOT NULL, "userId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_802ac6b9099f86aa24eb22d9c05" PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "creatorId" integer NOT NULL, "text" character varying NOT NULL, "points" integer NOT NULL DEFAULT '0', "link" character varying, "postAuthorId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "upvote" ADD CONSTRAINT "FK_3abd9f37a94f8db3c33bda4fdae" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upvote" ADD CONSTRAINT "FK_efc79eb8b81262456adfcb87de1" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_7b2abb783a76e512f34cdc84dbb" FOREIGN KEY ("postAuthorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_7b2abb783a76e512f34cdc84dbb"`);
        await queryRunner.query(`ALTER TABLE "upvote" DROP CONSTRAINT "FK_efc79eb8b81262456adfcb87de1"`);
        await queryRunner.query(`ALTER TABLE "upvote" DROP CONSTRAINT "FK_3abd9f37a94f8db3c33bda4fdae"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "upvote"`);
    }

}
