import React from 'react';
/**
 * Generates the game details, including list of found words.
 */
function GameDetails({sourceWord, targets}) {
  return (
    <div>
      <h3>Find translations for</h3>
      <h2>{sourceWord}</h2>
      <ul className='found-words'>
        {
          targets.map((target) => {
            if(target.found) {
              return(
                <li key={target.word}>{target.word}</li>
              );
            } else {
              return null
            }
          })
        }
      </ul>
    </div>
  )
}

export default GameDetails;