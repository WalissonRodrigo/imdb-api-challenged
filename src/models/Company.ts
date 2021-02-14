import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Length, IsNotEmpty, MinLength } from "class-validator";
import { Movie } from "./Movie";

const companiesList = [
  {
    id: 1,
    name: "Regency Enterprises",
  },
  {
    id: 2,
    name: "Fox 2000 Pictures",
  },
  {
    id: 3,
    name: "Taurus Film",
  },
  {
    id: 4,
    name: "Linson Films",
  },
  {
    id: 5,
    name: "Atman Entertainment",
  },
  {
    id: 6,
    name: "Knickerbocker Films",
  },
  {
    id: 7,
    name: "20th Century Fox",
  },
];

@Entity()
export class Company {
  static mockTestCompany(): Company {
    const company: Company = <Company>(
      companiesList[Math.floor(Math.random() * companiesList.length - 1)]
    );
    return company;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  @Length(3, 30)
  name: string;

  @ManyToMany(() => Movie, movie => movie.companies)
  movies: Movie[];
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
