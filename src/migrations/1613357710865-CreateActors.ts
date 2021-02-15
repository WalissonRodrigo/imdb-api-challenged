/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { Actor } from "../models/Actor";
import actors from "./Actors.seed";

export class CreateActors1613357710865 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    try {
      const actorRepository = getRepository(Actor);
      await actorRepository.save(actors);
    } catch (error) {
      console.log(error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.clearTable("actor");
  }
}
