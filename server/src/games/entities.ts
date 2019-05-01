import { Letter } from "./entities";
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  OneToMany,
  ManyToOne
} from "typeorm";
import User from "../users/entity";
export type Letter = string;
export type Row = [
  Letter,
  Letter,
  Letter,
  Letter,
  Letter,
  Letter,
  Letter,
  Letter,
  Letter,
  Letter
];
export type Board = [
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row,
  Row
];
type Status = "pending" | "started" | "finished";
const letter: Letter = randomLetter();
function randomLetter() {
  const chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "QU",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];


  let randomCharIndex = Math.floor(Math.random() * chars.length);
  const randomChar = chars[randomCharIndex];
  return randomChar;
}



let row: Row = randomRow()
function randomRow(){
  for ( let i=0; i<10 ; i++){
    return randomLetter()
  }
  for (let j=0; j<10; j++){
    return 
  }
}

// function randomRow(){
//   for( let i=0; i<10; i++){
//     randomLetter()
//   }
// }

// [
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter(),
//   randomLetter()
// ] 

const board: Board = [
  row,
  row,
  row,
  row,
  row,
  row,
  row,
  row,
  row,
  row
];

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: Number;
  @Column("json", { default: board })
  board: Board;
  @Column("char", { length: 1, default: "a" })
  turn: Symbol;
  @Column("char", { length: 1, nullable: true })
  winner: Symbol;
  @Column("text", { default: "pending" })
  status: Status;
  // this is a relation, read more about them here:
  // http://typeorm.io/#/many-to-one-one-to-many-relations
  @OneToMany(_ => Player, player => player.game, { eager: true })
  players: Player[];
}
@Entity()
@Index(["game", "user", "symbol"], { unique: true })
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;
  @ManyToOne(_ => User, user => user.players)
  user: User;
  @ManyToOne(_ => Game, game => game.players)
  game: Game;
  @Column("char", { length: 1 })
  symbol: Symbol;
  @Column("integer", { name: "user_id" })
  userId: number;
}
