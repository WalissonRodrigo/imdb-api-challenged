import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";
import { Length, IsNotEmpty, MinLength } from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  @Length(3, 20)
  name: string;

  @Column()
  @IsNotEmpty()
  @MinLength(7)
  @Length(7, 20)
  email: string;

  @Column()
  @Length(6, 100)
  password: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
