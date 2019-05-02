import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, 
  Body, Patch 
} from 'routing-controllers'
import User from '../users/entity'
import { Game, Player, Board } from './entities'
import {IsBoard, isValidTransition, calculateWinner, finished} from './logic'
import { Validate } from 'class-validator'
import {io} from '../index'
import { Router } from 'express';
import { IndexMetadata } from 'typeorm/metadata/IndexMetadata';

const words = ['SPAIN', 'FRANCE', 'MONACO', 'ITALY', 'SLOVENIA', 'CROATIA', 'ALBANIA', 'GREECE', 'TURKEY', 'SYRIA', 'LEBANON', 'ISRAEL', 'EGYPT', 'LIBYA', 'TUNISIA', 'ALGERIA', 'MOROCCO', 'MALTA', 'CYPRUS']
const letters=['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
// const allOrientations= ['horizontal']
// const orientation= {horizontal: function(x,y,i) { return {x: x+i, y: y  }}}
// const checkOrientation ={horizontal: function(x,y,h,w,l) { return w >= x + l}}
// const skipOrientations = {horizontal: function(x,y,l) { return {x: 0, y: y+1}}}


class GameUpdate {
  @Validate(IsBoard, {
    message: "Not a valid board"
  })
  board: Board;
}

@JsonController()
export default class GameController {
  @Authorized()
  @Post("/games")
  @HttpCode(201)
  async createGame(@CurrentUser() user: User) {
    function createRandomBoard() {
      const board: string[][] = [];

      for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        const row: string[] = [];

        for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
          
          const randomLetterIndex = Math.floor(Math.random() * letters.length)
          const randomLetter = letters[randomLetterIndex]
          row.push(randomLetter)
        }
        board.push(row)
      }
      return board;
    }

    const board = createRandomBoard();
    
    console.log("words test: ", words)
    console.log("board test:", board)
    
    const randomWordIndex = Math.floor(Math.random() * words.length)
    console.log("randomWordIndex", randomWordIndex)
    const word = words[randomWordIndex]
    console.log("word test:", word)
    const randomRowIndex = Math.floor(Math.random() * board.length)
    console.log("randomRowIndex test", randomRowIndex)
    const row = board[randomRowIndex]
    const randomColumnIndex=Math.floor(Math.random() * (9 - word.length)) 
   
    word.split("").map((letter, index) => {
       row[randomColumnIndex + index] = letter
    })
  
    const entity = new Game()
    entity.board = board

    await entity.save();

    await Player.create({
      game: entity,
      user
      // symbol: 'x'
    }).save();

    const game = await Game.findOneById(entity.id);

    io.emit("action", {
      type: "ADD_GAME",
      payload: game
    });

    return game;
  }

  @Authorized()
  @Post("/games/:id([0-9]+)/players")
  @HttpCode(201)
  async joinGame(@CurrentUser() user: User, @Param("id") gameId: number) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new BadRequestError(`Game does not exist`);
    if (game.status !== "pending")
      throw new BadRequestError(`Game is already started`);

    game.status = "started";
    await game.save();

    const player = await Player.create({
      game,
      user,
      symbol: "o"
    }).save();

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: await Game.findOneById(game.id)
    });

    return player;
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch("/games/:id([0-9]+)")
  async updateGame(
    @CurrentUser() user: User,
    @Param("id") gameId: number,
    @Body() update: GameUpdate
  ) {
    const game = await Game.findOneById(gameId);
    if (!game) throw new NotFoundError(`Game does not exist`);

    const player = await Player.findOne({ user, game });

    if (!player) throw new ForbiddenError(`You are not part of this game`);
    if (game.status !== "started")
      throw new BadRequestError(`The game is not started yet`);
    if (player.symbol !== game.turn)
      throw new BadRequestError(`It's not your turn`);
    if (!isValidTransition(player.symbol, game.board, update.board)) {
      throw new BadRequestError(`Invalid move`);
    }

    const winner = calculateWinner(update.board);
    if (winner) {
      game.winner = winner;
      game.status = "finished";
    } else if (finished(update.board)) {
      game.status = "finished";
    }
    // else {
    //   game.turn = player.symbol === 'x' ? 'o' : 'x'
    // }
    game.board = update.board;
    await game.save();

    io.emit("action", {
      type: "UPDATE_GAME",
      payload: game
    });

    return game;
  }

  @Authorized()
  @Get("/games/:id([0-9]+)")
  getGame(@Param("id") id: number) {
    return Game.findOneById(id);
  }

  @Authorized()
  @Get("/games")
  getGames() {
    return Game.find();
  }
}


