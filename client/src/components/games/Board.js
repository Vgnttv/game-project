import React from 'react'
import './Board.css'

const renderCel = (makeMove, rowIndex, cellIndex, symbol) => {
  return (
    //const isHighlited = if logic

    <button
      className="board-tile"
      // className={`board-tile${isHighlighted ? " highlight " : null}`}
      // disabled={hasTurn}
      onClick={() => makeMove(rowIndex, cellIndex)}
      key={`${rowIndex}-${cellIndex}`}
    >{symbol}</button>
  )
}

export default ({board, makeMove}) => board.map((cells, rowIndex) =>
  <div key={rowIndex}>
    {cells.map((symbol, cellIndex) => renderCel(makeMove, rowIndex, cellIndex,symbol,false))}
  </div>
)