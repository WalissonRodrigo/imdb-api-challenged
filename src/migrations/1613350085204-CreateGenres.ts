/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { Genre } from "../models/Genre";
import genres from "./Genres.seed";

export class CreateGenres1613350085204 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    try {
      const genreRepository = getRepository(Genre);
      await genreRepository.save(genres);
    } catch (error) {
      console.log(error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.clearTable("genre");
  }
}
