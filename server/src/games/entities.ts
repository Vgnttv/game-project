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

export type Row = string[]
export type Board = Row[]

type Status = "pending" | "started" | "finished";

const emptyRow: Row = ["A", "B", "F", "F", "F", "F", "F", "F", "F"];
const emptyBoard: Board = [
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow
];
// const letters=['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

// function createRandomBoard(){
//   const board: Array= []
//   const row: Array= []
//   let randomLettersIndex = Math.floor(Math.random() * letters.length);
//   const randomLetter: string = letters[randomLettersIndex];
//   // if (row.length === 0 ){
//   for (let i=0; i < row.length; i++){row.push(randomLetter)
//     // if (board.length === 0 ){
//       for (let j=0; j < board.length; j++){board.push(row[j])
//       };
//     // }
//     }
//   // }
// return board
// }
// const board: Board = createRandomBoard()

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("json", { default: emptyBoard })
  board: Board;

  @Column("char", { length: 1, default: "X" })
  turn: Symbol;

  @Column("char", { length: 1, nullable: true })
  winner: Symbol;

  @Column("text", { default: "pending" })
  status: Status;

  @OneToMany(_ => Player, player => player.game, { eager: true })
  players: Player[];
}

@Entity()
@Index(["game", "user"], { unique: true })
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(_ => User, user => user.players)
  user: User;

  @ManyToOne(_ => Game, game => game.players)
  game: Game;

  @Column("integer", { name: "user_id" })
  userId: number;
}
