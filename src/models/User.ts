import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Length, IsNotEmpty, MinLength } from "class-validator";
import bcrypt from "bcryptjs";
import { RefreshToken } from "./RefreshToken";

@Entity()
@Unique(["email"])
export class User {
  static mockTestUser(): User {
    const user = new User();
    user.id = 1;
    user.email = "admin@admin.com";
    user.password = "admin@123";
    user.name = "Admin Teste";
    user.role = "ADMIN";
    user.hashPassword();
    return user;
  }
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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  hashPassword(): void {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
