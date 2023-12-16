import React from "react";
import { useParams } from "react-router-dom";

const socket = require("../../connections/socket").socket;

const JoinGameRoom = (gameId, userName, isCreator) => {
  const idData = {
    gameId: gameId,
    userName: userName,
    isCreator: isCreator,
  };
  socket.emit("playerJoinGame", idData);
  console.log(idData);
};

const JoinGame = (props) => {
  const { gameid } = useParams();
  JoinGameRoom(gameid, props.userName, props.isCreator);
  console.log(props.userName);
  return (
    <>
      <h1>Welcome to Play Vs Friend!</h1>
      <div>{JSON.stringify(props.userName)}</div>
    </>
  );
};

export default JoinGame;
