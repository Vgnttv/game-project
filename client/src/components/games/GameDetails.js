import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { getGames, joinGame, updateGame } from "../../actions/games";
import { getUsers } from "../../actions/users";
import { userId } from "../../jwt";
import Paper from "@material-ui/core/Paper";
import Board from "./Board";
import "./GameDetails.css";
import { Animated } from "react-animated-css";

class GameDetails extends PureComponent {
  componentWillMount() {
    if (this.props.authenticated) {
      if (this.props.game === null) this.props.getGames();
      if (this.props.users === null) this.props.getUsers();
    }
  }

  joinGame = () => this.props.joinGame(this.props.game.id);

  makeMove = (toRow, toCell) => {
    console.log("toRow test:", toRow);
    console.log("toCell test:", toCell);

    const { game, updateGame } = this.props;

    const isCorrect = game.words.some(word => {
      return word.row === toRow && word.column === toCell;
    });

    // if (isCorrect === true) {
    //   return isHighlighted
    // } else {
    //   return false
    // }

    console.log("isCorrect test:", isCorrect);

    // const board = game.board;

    console.log("game test:", game);
    console.log("words test:", game.words);

    updateGame(game.id, [toRow, toCell]);
  };

  render() {
    const { game, users, authenticated, userId } = this.props;

    if (!authenticated) return <Redirect to="/login" />;

    if (game === null || users === null) return "Loading...";
    if (!game) return "Not found";

    const player = game.players.find(p => p.userId === userId);

    const winner = game.players.find(p => p.winner === true);
    // .filter(p => p.symbol === game.winner)
    // .map(p => p.userId)[0]

    console.log("winner", winner);

    return (
      <Paper className="outer-paper">
        <div className="board">
          {!winner && (
            <div className="instructions">
              <h1 className="h1">Game #{game.id}</h1>
              <p className="instructionsList">Status: {game.status} </p>
              <ul className="instructionsList">
                <li>There are seven hidden Simpson's related words</li>
                <li>Click on their first letter </li>{" "}
                <li>May the fastest player win </li>
              </ul>
            </div>
          )}

          {winner && (
            <Animated
              className="winner"
              animationIn="tada"
              animationOut="fadeOut"
              isVisible={true}
            >
              {/* <div className="instructions"> */}
              <h1 className="h1">Game #{game.id}</h1>
              <h1 className="instructionsList">Winner: User {winner.userId}</h1>
              <p className="instructionsList">Status: {game.status} </p>
              {/* </div> */}
              <img
                className="gif"
                src="https://media.giphy.com/media/l0G18ZtB6c6PJjmlW/giphy.gif"
              />
            </Animated>
          )}

          {game.status === "pending" &&
            game.players.map(p => p.userId).indexOf(userId) === -1 && (
              <button onClick={this.joinGame}>Join Game</button>
            )}

          <hr />

          {!winner && game.status !== "pending" &&  (
            <Animated
              className="Board"
              animationIn="bounceInLeft"
              animationOut="fadeOut"
              isVisible={true}
            >
              <ul className="WordList">
                {game.words.map(word => {
                  return <p key={word.id}>{word.text}</p>;
                })}
              </ul>
              <Board board={game.board} makeMove={this.makeMove} />
            </Animated>
          )}
        </div>
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.currentUser !== null,
  userId: state.currentUser && userId(state.currentUser.jwt),
  game: state.games && state.games[props.match.params.id],
  users: state.users
});

const mapDispatchToProps = {
  getGames,
  getUsers,
  joinGame,
  updateGame
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDetails);
