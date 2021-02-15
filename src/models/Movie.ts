import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsNotEmpty, MinLength } from "class-validator";
import { Company } from "./Company";
import moment from "moment";
import { Genre } from "./Genre";
import { Actor } from "./Actor";

const statusList = ["Released", "Trailer", "Canceled"];

@Entity()
export class Movie {
  static mockTestMovie(): Movie {
    const movie = new Movie();
    movie.id = 1;
    movie.releaseDate = moment("1999-10-12").toDate();
    movie.budget = 63000000;
    movie.originalTitle = "Fight Club";
    movie.overview =
      'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.';
    movie.popularity = 0.5;
    movie.revenue = 100853753;
    movie.status = "Released";
    movie.tagline =
      "How much can you know about yourself if you've never been in a fight?";
    movie.title = "Fight Club";
    movie.voteAverage = 7.8;
    movie.voteCount = 3439;
    // movie.actors = <Actor[]>[{ id: 1 }, { id: 2 }];
    // movie.companies = <Company[]>[{ id: 1 }, { id: 2 }];
    // movie.genres = <Genre[]>[{ id: 2 }, { id: 4 }, { id: 7 }];
    return movie;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @Column({ length: 255 })
  @IsNotEmpty()
  originalTitle: string;

  @Column({ length: 1000 })
  @IsNotEmpty()
  overview: string;

  @Column({ length: 400 })
  tagline: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column({ default: statusList[0] })
  status: string;

  @Column({ default: 0.0, type: "float" })
  budget: number;

  @Column({ default: 0.0, type: "float" })
  popularity: number;

  @Column({ default: 0.0, type: "float" })
  revenue: number;

  @Column({ default: 0.0, type: "float" })
  voteAverage: number;

  @Column({ default: 0 })
  voteCount: number;

  @Column({ nullable: true })
  releaseDate: Date;

  @ManyToMany(() => Company, (company) => company.movies)
  @JoinTable()
  companies: Company[];

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @ManyToMany(() => Actor, (actor) => actor.movies)
  @JoinTable()
  actors: Actor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
