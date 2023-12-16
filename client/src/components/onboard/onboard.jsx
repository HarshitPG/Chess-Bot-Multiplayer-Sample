import React, { useState, useRef, useContext } from "react";
import { Navigate } from "react-router-dom";
import { ColorContext } from "../../context/colorMultiplayer/colorContext";
import { v4 as uuid } from "uuid";
const socket = require("../../connections/socket").socket;

function CreateNewGame({ didRedirect, setUserName }) {
  const [state, setState] = useState({
    didGetUserName: false,
    inputText: "",
    gameId: "",
  });

  const textArea = useRef();

  const send = () => {
    const newGameRoomId = uuid();
    setState((prevState) => ({
      ...prevState,
      gameId: newGameRoomId,
    }));
    socket.emit("createNewGame", newGameRoomId);
  };

  const typingUserName = () => {
    const typedText = textArea.current.value;
    setState((prevState) => ({
      ...prevState,
      inputText: typedText,
    }));
  };

  console.log(state);

  return (
    <>
      {state.didGetUserName ? (
        <Navigate to={"/game/" + state.gameId} />
      ) : (
        <div>
          <h1>Your Name:</h1>
          <input ref={textArea} onInput={typingUserName}></input>
          <button
            disabled={!(state.inputText.length > 0)}
            onClick={() => {
              didRedirect();
              setUserName(state.inputText);
              setState((prevState) => ({
                ...prevState,
                didGetUserName: true,
              }));
              send();
            }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}

function Onboard(props) {
  const color = useContext(ColorContext);

  return (
    <CreateNewGame
      didRedirect={color.playerDidRedirect}
      setUserName={props.setUserName}
    />
  );
}

export default Onboard;
