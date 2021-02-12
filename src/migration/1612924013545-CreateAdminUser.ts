/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../entity/User";

export class CreateAdminUser1612924013545 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const user = new User();
    user.name = "Walisson Rodrigo";
    user.email = "walissonrodrigo@outlook.com";
    user.password = "admin@123";
    user.hashPassword();
    user.role = "ADMIN";
    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
