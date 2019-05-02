
import React, {Component} from 'react';
import Board from './Board';
import GameDetails from './Details';

/**
 * The game. Organises relevent components and handles game logic.
 */
class Game extends React.Component {

  /**
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      puzzleIndex: 0,
      sourceWord: props.data[0].word,
      squares: this.getSquares(props.data[0].character_grid),
      targets: this.getTargets(props.data[0].word_locations)
    };
  }

 /**
  * Sets up the state for the next puzzle.
  */
  setNextPuzzle() {
    // Progress to next puzzle, looping back to first if needed.
    const index = (this.state.puzzleIndex + 1) % this.state.data.length;
    // For convenience.
    const data = this.state.data[index];
    // Update state to reflect the current puzzle.
    this.setState({
      puzzleIndex: index,
      sourceWord: data.word,
      squares: this.getSquares(data.character_grid),
      targets: this.getTargets(data.word_locations)
    });
  }


  /**
   * Triggered when the user makes a selection on the game board.
   * @param  {Array} selected List of points of square locations.
   */
  handleMakeSelection(selected) {

    // To track any answer we might find.
    let revealedTarget = null;

    // Is anything currently selected?
    if(selected && selected.length) {
      // Make sure the selected points are sorted.
      selected.sort(this.comparePoints);
      // Now we can compare to the anwers.
      for(let target of this.state.targets) {
        // Skip over if we've already found this target word,
        // or if it's a different length to our selection.
        if(!target.found && target.points.length == selected.length) {
          // Now because we've sorted our targets and selection we
          // can just check each point for equality.
          let match = true;
          for(let i = 0; i < selected.length; i++) {
            if(this.comparePoints(selected[i], target.points[i]) != 0) {
              match = false;
              break;
            }
          }

          // Did all points match?
          if(match) {
            revealedTarget = target;
            break;
          }
        }
      }
    }

    // Did we find an answer?
    if(revealedTarget) {

      // TODO: Fix this. Should not be directly manipulating the state object
      // like this: Mark answer as being found.
      revealedTarget.found = true;

      // Update all target squares to be revealed
      const squares = this.state.squares.slice();
      for(let point of revealedTarget.points) {
        squares[point.row][point.col].revealed = true;
      }

      // Update state with revealed squares.
      this.setState({
        squares: squares
      })

      // Check if we've found all the answers.
      this.checkPuzzleComplete();
    }

  }

  /**
   * Checks if all answers have been found and if so progresses to the next
   * puzzle after a time delay.
   */
  checkPuzzleComplete() {
    // Check if we've found all targets.
    for(let target of this.state.targets) {
      if(!target.found) {
        // Bail out if we haven't found all targets yet.
        return;
      }
    }

    // All targets must be found. Automatically load next puzzle after
    // 2.5 seconds. This is a bit of a hack. Would ideally do this differnlty.
    setTimeout(function() {
      this.setNextPuzzle();
    }.bind(this), 2500);
  }

  /**
   * Used for sorting a list of points. Ideally this would go in a util class.
   * @param  {Point} a
   * @param  {Point} b
   * @return {int}   1 if a is greater, -1 if be is greater, 0 if equal
   */
  comparePoints(a, b) {
    if(a.row === b.row) {
      if(a.col === b.col) {
        return 0;
      } else {
        return a.col > b.col ? 1 : -1;
      }
    } else {
      return a.row > b.row ? 1 : -1;
    }
  }

  /**
   * Converts the target data from the data source into a more usable form
   * @param  {Object} targetData dictionary of location string : word pairs
   * @return {Array}            array of target objects
   */
  getTargets(targetData) {
    let targets = [];
    for (let key in targetData) {

      // Convert delimted string to array of ints.
      let numbers = key.split(',').map((strVal) => {
        return parseInt(strVal);
      });
      // Convert array of ints to array of points.
      let points = this.extractPoints(numbers);
      // Sort points with our sorting algorithm.
      points.sort(this.comparePoints);

      // Aded new target object to targets list.
      targets.push({
        word: targetData[key],
        points: points,
        found: false
      })
    }
    // Return list of targets.
    return targets;
  }

  /**
   * Converts a list of integers into a list of point objects
   * @param  {Array} list List of numbers corresponding to columns,rows.
   * @return {Array}      Array of Point objects.
   */
  extractPoints(numbers) {
    let points = [];
    for(let i = 1; i < numbers.length; i += 2) {
      points.push({
        row: numbers[i],
        col: numbers[i-1]
      })
    }
    return points;
  }

  /**
   * Converts the grid data from the data source into a more usable form.
   * @param  {Array} squareData Array of arrays of strings containing the letter for each square.
   * @return {Array}            Array of arrays of objects with value and revealed properties.
   */
  getSquares(squareData){

    var squares = [];

    for(var r = 0; r < squareData.length; r++) {
      squares.push([]);
      for(var c = 0; c < squareData[r].length; c++) {
        squares[r].push({
          value: squareData[r][c],
          revealed: false
        })
      }
    }

    return squares;
  }

  /**
   * Renders the game.
   */
  render() {
    return(
      <div className='game-container'>

        <div className='game-board'>
          <Board squares={this.state.squares} onMakeSelection={this.handleMakeSelection.bind(this)} />
        </div>

        <div className='game-details'>
          <GameDetails sourceWord={this.state.sourceWord} targets={this.state.targets} />
        </div>

      </div>
    );
  }

}

export default Game;