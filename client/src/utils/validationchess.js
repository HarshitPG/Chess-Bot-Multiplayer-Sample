import React, { useEffect, useState, useRef } from "react";
import { Chess } from "chess.js";
import $ from "jquery";

const ChessComponent = () => {
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
export default ChessComponent;
