import { 
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get, 
  Body, Patch 
} from 'routing-controllers'
import User from '../users/entity'
import { Game, Player, Board } from './entities'
import {IsBoard, isValidTransition, calculateWinner, finished} from './logic'
import { Validate } from 'class-validator'
import {io} from '../index'

const RANDOM_WORDS = ['SPAIN', 'FRANCE', 'MONACO', 'ITALY', 'SLOVENIA', 'CROATIA', 'BOSNIA AND HERZEGOVINA', 'MONTENEGRO', 'ALBANIA', 'GREECE', 'TURKEY', 'SYRIA', 'LEBANON', 'ISRAEL', 'EGYPT', 'LIBYA', 'TUNISIA', 'ALGERIA', 'MOROCCO', 'MALTA', 'CYPRUS']
const letter='ABCDEFGHIJKLMNOPRSTUVWXYZ'
const allOrientations= ['horizontal']
const orientation= {horizontal: function(x,y,i) { return {x: x+i, y: y  }}}
const checkOrientation ={horizontal: function(x,y,h,w,l) { return w >= x + l}}
const skipOrientations = {horizontal: function(x,y,l) { return {x: 0, y: y+1}}}
const pickRandomWord = 

class GameUpdate {

  @Validate(IsBoard, {
    message: 'Not a valid board'
  })
  board: Board
}

@JsonController()
export default class GameController {

  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    // const board = createRandomBoard()
    // const word = pickRandomWord()
    // const location = pickRandomLocation()
    // const orientation = pickRandomOrientation()
    

    const entity = await Game.create().save()

    await Player.create({
      game: entity, 
      user,
      symbol: 'x'
    }).save()

    const game = await Game.findOneById(entity.id)

    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    })

    return game
  }

  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new BadRequestError(`Game does not exist`)
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`)

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game, 
      user,
      symbol: 'o'
    }).save()

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    })

    return player
  }

  @Authorized()
  // the reason that we're using patch here is because this request is not idempotent
  // http://restcookbook.com/HTTP%20Methods/idempotency/
  // try to fire the same requests twice, see what happens
  @Patch('/games/:id([0-9]+)')
  async updateGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() update: GameUpdate
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new NotFoundError(`Game does not exist`)

    const player = await Player.findOne({ user, game })

    if (!player) throw new ForbiddenError(`You are not part of this game`)
    if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)
    if (player.symbol !== game.turn) throw new BadRequestError(`It's not your turn`)
    if (!isValidTransition(player.symbol, game.board, update.board)) {
      throw new BadRequestError(`Invalid move`)
    }    

    const winner = calculateWinner(update.board)
    if (winner) {
      game.winner = winner
      game.status = 'finished'
    }
    else if (finished(update.board)) {
      game.status = 'finished'
    }
    // else {
    //   game.turn = player.symbol === 'x' ? 'o' : 'x'
    // }
    game.board = update.board
    await game.save()
    
    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: game
    })

    return game
  }

  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame(
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }

  @Authorized()
  @Get('/games')
  getGames() {
    return Game.find()
  }
}

var findBestLocations = function (puzzle, options, word) {

  var locations = [],
      height = options.height,
      width = options.width,
      wordLength = word.length,
      maxOverlap = 0; // we’ll start looking at overlap = 0

  // loop through all of the possible orientations at this position
  for (var k = 0, len = options.orientations.length; k < len; k++) {

    var orientation = options.orientations[k],
        check = checkOrientations[orientation],
        next = orientations[orientation],
        skipTo = skipOrientations[orientation],
        x = 0, y = 0;

    // loop through every position on the board
    while( y < height ) {

      // see if this orientation is even possible at this location
      if (check(x, y, height, width, wordLength)) {

        // determine if the word fits at the current position
        var overlap = calcOverlap(word, puzzle, x, y, next);

        // if the overlap was bigger than previous overlaps that we’ve seen
        if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
          maxOverlap = overlap;
          locations.push({x: x, y: y, orientation: orientation, overlap: overlap});
        }

        x++;
        if (x >= width) {
          x = 0;
          y++;
        }
      } else {
        // if current cell is invalid, then skip to the next cell where
        // this orientation is possible. this greatly reduces the number
        // of checks that we have to do overall
        var nextPossible = skipTo(x,y,wordLength);
        x = nextPossible.x;
        y = nextPossible.y;
      }

    }
  }

  // finally prune down all of the possible locations we found by
  // only using the ones with the maximum overlap that we calculated
  return options.preferOverlap ?
         pruneLocations(locations, maxOverlap) :
         locations;
};