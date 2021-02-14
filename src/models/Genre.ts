import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Length, IsNotEmpty, MinLength } from "class-validator";
import { Movie } from "./Movie";

const genreList = [
  "Action",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Thriller",
  "Western",
];

@Entity()
export class Genre {
  static mockTestGenres(): Genre {
    const genre = new Genre();
    genre.id = 1;
    genre.name = genreList[Math.floor(Math.random() * genreList.length - 1)];
    return genre;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  @Length(3, 30)
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  @JoinTable()
  movies: Movie[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
