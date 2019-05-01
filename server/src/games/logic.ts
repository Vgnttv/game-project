import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { Board, Symbol, Row } from './entities'

@ValidatorConstraint()
export class IsBoard implements ValidatorConstraintInterface {

  validate(board: Board) {
    const symbols = [ 'x', 'o', null ]
    return board.length === 3 &&
      board.every(row =>
        row.length === 3 &&
        row.every(symbol => symbols.includes(symbol))
      )
  }
}

export const isValidTransition = (playerSymbol: Symbol, from: Board, to: Board) => {
  const changes = from
    .map(
      (row, rowIndex) => row.map((symbol, columnIndex) => ({
        from: symbol, 
        to: to[rowIndex][columnIndex]
      }))
    )
    .reduce((a,b) => a.concat(b))
    .filter(change => change.from !== change.to)

  return changes.length === 1 && 
    changes[0].to === playerSymbol && 
    changes[0].from === null
}

export const calculateWinner = (board: Board): Symbol | null =>
  board
    .concat(
      // vertical winner
      [0, 1, 2].map(n => board.map(row => row[n])) as Row[]
    )
    .concat(
      [
        // diagonal winner ltr
        [0, 1, 2].map(n => board[n][n]),
        // diagonal winner rtl
        [0, 1, 2].map(n => board[2-n][n])
      ] as Row[]
    )
    .filter(row => row[0] && row.every(symbol => symbol === row[0]))
    .map(row => row[0])[0] || null

export const finished = (board: Board): boolean =>
  board
    .reduce((a,b) => a.concat(b) as Row)
    .every(symbol => symbol !== null)

// import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
// import { Board, Letter, Row } from './entities'

// @ValidatorConstraint()
// export class IsBoard implements ValidatorConstraintInterface {

//   validate(board: Board) {
//     const symbols = [ 
//       "A",
//       "B",
//       "C",
//       "D",
//       "E",
//       "F",
//       "G",
//       "H",
//       "I",
//       "J",
//       "K",
//       "L",
//       "M",
//       "N",
//       "O",
//       "P",
//       "R",
//       "S",
//       "T",
//       "U",
//       "V",
//       "W",
//       "X",
//       "Y",
//       "Z"
//     ];

//     return board.length === 9 &&
//       board.every(row =>
//         row.length === 9 &&
//         row.every(symbol => symbols.includes(symbol))
//       )
//   }
// }

// // export const isValidTransition = (playerSymbol: Symbol, from: Board, to: Board) => {
// //   const changes = from
// //     .map(
// //       (row, rowIndex) => row.map((symbol, columnIndex) => ({
// //         from: symbol, 
// //         to: to[rowIndex][columnIndex]
// //       }))
// //     )
// //     .reduce((a,b) => a.concat(b))
// //     .filter(change => change.from !== change.to)

// //   return changes.length === 1 && 
// //     changes[0].to === playerSymbol && 
// //     changes[0].from === null
// // }

// // export const calculateWinner = (board: Board): Symbol | null =>
// //   board
// //     .concat(
// //       // vertical winner
// //       [0, 1, 2].map(n => board.map(row => row[n])) as Row[]
// //     )
// //     .concat(
// //       [
// //         // diagonal winner ltr
// //         [0, 1, 2].map(n => board[n][n]),
// //         // diagonal winner rtl
// //         [0, 1, 2].map(n => board[2-n][n])
// //       ] as Row[]
// //     )
// //     .filter(row => row[0] && row.every(symbol => symbol === row[0]))
// //     .map(row => row[0])[0] || null

// export const finished = (board: Board): boolean =>
//   board
//     .reduce((a,b) => a.concat(b) as Row)
//     .every(symbol => symbol !== null)
