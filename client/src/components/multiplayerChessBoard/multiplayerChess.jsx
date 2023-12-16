import React, { useEffect, useState, useRef, useContext } from "react";
import { Chess } from "chess.js";
import $ from "jquery";
import { useParams } from "react-router-dom";
import { ColorContext } from "../../context/colorMultiplayer/colorContext";
const socket = require("../../connections/socket").socket;

const MultiplayerChessGameComponent = (props) => {
  const color = useContext(ColorContext);
  const { gameid } = useParams();
  const [opponentSocketId, setOpponentSocketId] = useState("");
  const [opponentDidJoinTheGame, setOpponentDidJoinTheGame] = useState(false);
  const [opponentUserName, setOpponentUserName] = useState("");
  const [gameSessionDoesNotExist, setGameSessionDoesNotExist] = useState(false);

  useEffect(() => {
    const handlePlayerJoinedRoom = (statusUpdate) => {
      if (socket.id !== statusUpdate.mySocketId) {
        setOpponentSocketId(statusUpdate.mySocketId);
        console.log(statusUpdate.mySocketId);
      }
    };
    const handleStatusUpdate = (statusUpdate) => {
      console.log(statusUpdate.mySocketId);

      if (
        statusUpdate === "This game session does not exist." ||
        statusUpdate === "There are already 2 people playing in this room"
      ) {
        setGameSessionDoesNotExist(true);
      }
    };

    const handleStartGame = (opponentUserName) => {
      if (opponentUserName !== props.myUserName) {
        setOpponentUserName(opponentUserName);
        setOpponentDidJoinTheGame(true);
      } else {
        socket.emit("request username", gameid);
      }
    };

    const handleGiveUserName = (socketId) => {
      if (socket.id !== socketId) {
        socket.emit("recieved userName", {
          userName: props.myUserName,
          gameId: gameid,
        });
      }
    };

    const handleGetOpponentUserName = (data) => {
      if (socket.id !== data.socketId) {
        setOpponentUserName(data.userName);
        setOpponentSocketId(data.socketId);
        setOpponentDidJoinTheGame(true);
      }
    };

    socket.on("playerJoinedRoom", handlePlayerJoinedRoom);
    socket.on("status", handleStatusUpdate);
    socket.on("start game", handleStartGame);
    socket.on("give userName", handleGiveUserName);
    socket.on("get Opponent UserName", handleGetOpponentUserName);

    return () => {
      socket.off("playerJoinedRoom", handlePlayerJoinedRoom);
      socket.off("status", handleStatusUpdate);
      socket.off("start game", handleStartGame);
      socket.off("give userName", handleGiveUserName);
      socket.off("get Opponent UserName", handleGetOpponentUserName);
    };
  }, [gameid, props.myUserName]);

  return (
    <React.Fragment>
      {opponentDidJoinTheGame ? (
        <div>
          <h4> Opponent: {opponentUserName} </h4>
          <div style={{ display: "flex" }}>
            <ChessGameMultiPlayer
              gameId={gameid}
              color={color.didRedirect}
              myUserName={props.myUserName}
              opponentUserName={opponentUserName}
              opponentSocketId={opponentSocketId}
            />
          </div>
          <h4> You: {props.myUserName} </h4>
        </div>
      ) : gameSessionDoesNotExist ? (
        <div>
          <h1> :( There are already 2 people playing in this room</h1>
        </div>
      ) : (
        <div>
          <h1>
            Hey <strong>{props.myUserName}</strong>, copy and paste the URL
            below to send to your friend:
          </h1>
          <textarea
            onFocus={(event) => {
              event.target.select();
            }}
            value={"http://localhost:3000/game/" + gameid}
            type="text"
          ></textarea>
          <br />
          <h1>Waiting for the other opponent to join the game...</h1>
        </div>
      )}
    </React.Fragment>
  );
};

const ChessGameMultiPlayer = () => {
  let board = null;

  const [game, setGame] = useState(new Chess());
  const statusArrayRef = useRef([]);

  const updateStatus = () => {
    const $status = document.getElementById("status");
    const $fen = document.getElementById("fen");
    const $pgn = $("#pgn");

    let status = "";

    let moveColor = "White";
    if (game.turn() === "b") {
      moveColor = "Black";
    }

    if (game.isCheckmate()) {
      status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.isDraw()) {
      status = "Game over, drawn position";
    } else {
      status = `${moveColor}`;
      if (game.isCheck()) {
        status += `, ${moveColor} is in check`;
      }
    }

    // setStatusArray((prevStatusArray) => [...prevStatusArray, status]);
    // console.log(statusArray);
    statusArrayRef.current.push(status);
    console.log(statusArrayRef);
    statusArrayRef.current[0] = "";

    game.history({ verbose: true });
    console.log(game.history({ verbose: true }));

    $status.innerHTML = status;
    $fen.innerHTML = game.fen();

    const regex = /(\d+\.)+/g;
    const pgnMoves = game
      .pgn()
      .replace(regex, "")
      .split(/(?:\d+\.\d+|\s)+/g);

    $pgn.html(
      pgnMoves.map(
        (move, index) =>
          `<ul class="move move-${index}">${statusArrayRef.current[index]} ${move}</ul>`
      )
    );
  };
  const handleNewGameClick = () => {
    game.reset();
    board.position("start");
    game.pgn();
    statusArrayRef.current.length = 1;
    updateStatus();
  };

  function make_move() {
    $.post(
      "http://127.0.0.1:5000/make_move",
      { fen: game.fen() },
      function (data) {
        console.log(data.fen);

        game.move(data.best_move, { sloppy: true });

        board.position(game.fen());

        console.log("board fen: " + board.fen());
        console.log("game fen: " + game.fen());

        updateStatus();
      }
    );
  }

  const handleMakeMoveClick = () => {
    make_move();
  };

  const handleUndoMoveClick = () => {
    game.undo();

    board.position(game.fen());

    updateStatus();
  };

  const handleFlipBoardClick = () => {
    board.flip();
  };

  useEffect(() => {
    function onDragStart(source, piece, position, orientation) {
      if (game.isGameOver()) return false;

      if (
        (game.turn() === "w" && piece.search(/^b/) !== -1) ||
        (game.turn() === "b" && piece.search(/^w/) !== -1)
      ) {
        return false;
      }
    }

    function onDrop(source, target) {
      try {
        const move = game.move({
          from: source,
          to: target,
          promotion: "q",
        });

        if (move === null) {
          return "snapback";
        }

        console.log("board fen: " + board.fen());
        console.log("game fen: " + game.fen());

        make_move();

        updateStatus();
      } catch (error) {
        console.error("An error occurred while making the move:", error);
      }
    }

    function onSnapEnd() {
      board.position(game.fen());
    }

    const config = {
      draggable: true,
      position: "start",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: "/img/chesspieces/wikipedia/{piece}.png",
    };

    board = window.Chessboard("myBoard", config);

    updateStatus();
  }, [game, board, updateStatus]);

  return (
    <div>
      <div id="myBoard" style={{ width: "400px" }}></div>
      <strong>STATUS</strong>
      <div id="status"></div>
      <strong>FEN</strong>
      <div id="fen"></div>
      <strong>PGN</strong>
      <div id="pgn"></div>
      <button id="new_game" onClick={handleNewGameClick}>
        NEW GAME
      </button>
      <button id="make_move" onClick={handleMakeMoveClick}>
        MAKE MOVE
      </button>
      <button id="undo-move" onClick={handleUndoMoveClick}>
        UNDO MOVE
      </button>
      <button id="flip_board" onClick={handleFlipBoardClick}>
        FLIP BOARD
      </button>
    </div>
  );
};

export default MultiplayerChessGameComponent;
