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

const GENDER = {
  FEMALE: 1,
  MALE: 2,
  OTHER: 3,
};

const actorsList = [
  {
    id: 1,
    name: "Robert De Niro",
    gender: GENDER.MALE,
    bio: `One of the greatest actors of all time, Robert De Niro was born on August 17, 1943 in Manhattan,
       New York City, to artists Virginia (Admiral) and Robert De Niro Sr. His paternal grandfather was of Italian descent,
        and his other ancestry is Irish, English, Dutch, German, and French.`,
    movies: [
      {
        title: "Touro Indomável",
        originalTitle: "Raging Bull",
      },
    ],
  },
  {
    id: 2,
    name: "Jack Nicholson",
    gender: GENDER.MALE,
    bio: `Jack Nicholson, an American actor, producer, director and screenwriter, is a three-time
     Academy Award winner and twelve-time nominee. Nicholson is also notable for 
     being one of two actors - the other being Michael Caine - who have received an Oscar nomination 
     in every decade from the 1960s through the early 2000s.`,
    movies: [
      {
        title: "Chinatown",
        originalTitle: "Chinatown",
      },
    ],
  },
  {
    id: 3,
    name: "Halle Berry",
    gender: GENDER.MALE,
    bio: `Halle Maria Berry was born Maria Halle Berry on August 14, 1966 in Cleveland, 
    Ohio & raised in Bedford, Ohio. Halle was born to Judith Ann Hawkins, 
    a psychiatric nurse & Jerome Jesse Berry, a hospital attendant. 
    Halle first came into the spotlight at seventeen years when she won 
    the Miss Teen All-American Pageant, representing the state of Ohio in 1985 and, 
    a year later in 1986, when she was the first runner-up in the Miss U.S.A. Pageant. 
    After participating in the pageant, Halle became a model. 
    It eventually led to her first weekly TV series, 1989's Living Dolls (1989), 
    where she soon gained a reputation for her on-set tenacity, preferring to "live" 
    her roles and remaining in character even when the cameras stopped rolling. 
    It paid off though when she reportedly refused to bathe for several days before 
    starting work on her role as a crack addict in Spike Lee's Febre da Selva (1991) 
    because the role provided her big screen breakthrough. The following year, 
    she was cast as Eddie Murphy's love interest in O Príncipe das Mulheres (1992), 
    one of the few times that Murphy was evenly matched on screen. In 1994, 
    Berry gained a youthful following for her performance as sexy secretary "Sharon Stone" 
    in Os Flintstones: O Filme (1994). She next had a highly publicized starring role with 
    Jessica Lange in the adoption drama O Destino de uma Vida (1995). 
    Though the movie received mixed reviews, Berry didn't let that slow her down, 
    and continued down her path to super-stardom.`,
    movies: [
      {
        title: "Mulher-Gato",
        originalTitle: "Catwoman",
      },
    ],
  },
];

@Entity()
export class Actor {
  static mockTestCompany(): Actor {
    const company: Actor = <Actor>(
      actorsList[Math.floor(Math.random() * actorsList.length - 1)]
    );
    return company;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @MinLength(3)
  @Length(3, 55)
  name: string;

  @Column()
  @IsNotEmpty()
  bio: string;

  @Column({ enum: GENDER })
  gender: number;

  @ManyToMany(() => Movie, (movie) => movie.actors)
  @JoinTable()
  movies: Movie[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
