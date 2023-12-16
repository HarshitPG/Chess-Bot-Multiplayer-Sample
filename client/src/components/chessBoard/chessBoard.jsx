import React, { useEffect } from "react";

const ChessboardComponent = () => {
  useEffect(() => {
    // Initialize Chessboard.js after the component mounts
    const board = window.Chessboard("myBoard", "start");

    // Optionally, you can customize the chessboard here, e.g., set a custom position.
    // For example:
    // const customPosition = { a1: "bP", a2: "wP" };
    // board.position(customPosition);
  }, []);

  return (
    <div>
      <div id="myBoard" style={{ width: "400px" }}></div>
    </div>
  );
};

export default ChessboardComponent;
