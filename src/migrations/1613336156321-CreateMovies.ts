/* eslint-disable @typescript-eslint/no-unused-vars */
import { EROFS } from "constants";
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { Movie } from "../models/Movie";
import movies from "./Movies.seed";

export class CreateMovies1613336156321 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      const movieRepository = getRepository(Movie);
      await movieRepository.save(movies);
    } catch (error) {
      console.log(error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.clearTable("movie");
  }
}
