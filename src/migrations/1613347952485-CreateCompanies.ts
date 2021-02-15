/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { Company } from "../models/Company";
import companies from "./Companies.seed";

export class CreateCompanies1613347952485 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    try {
      const companyRepository = getRepository(Company);
      await companyRepository.save(companies);
    } catch (errors) {
      console.log(errors);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.clearTable("company");
  }
}
