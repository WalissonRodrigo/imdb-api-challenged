/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../models/User";
import users from "./Users.seed";

export class CreateAdminUser1612924013545 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    try {
      const listUser: User[] = new Array<User>();
      users.forEach((item) => {
        const user = new User();
        Object.keys(item).forEach((key) => {
          user[key] = item[key];
        });
        listUser.push(user);
      });
      const userRepository = getRepository(User);
      await userRepository.save(listUser);
    } catch (error) {
      console.log(error);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    _queryRunner.clearTable("user");
  }
}
