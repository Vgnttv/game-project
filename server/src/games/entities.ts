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

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("json", { nullable: true })
  board: Board;

  // @Column("char", { length: 1, default: "X" })
  // turn: Symbol;

  @Column("char", { length: 1, nullable: true })
  winner: Symbol;

  @Column("text", { default: "pending" })
  status: Status;

  @OneToMany(_ => Player, player => player.game, { eager: true })
  players: Player[];

  @OneToMany(_ => Word, word => word.game, { eager: true })
  words: Word[];
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

@Entity()
export class Word extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(_ => Game, game => game.players)
  game: Game;

  @Column("integer")
  row: number;

  @Column("integer")
  column: number;

  @Column("text")
  text: string;
}