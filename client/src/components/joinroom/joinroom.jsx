import React, { useState, useRef } from "react";
import JoinGame from "../joinGame/joinGame";
import MultiplayerChessGameComponent from "../multiplayerChessBoard/multiplayerChess";

const JoinRoom = () => {
  const [didGetUserName, setDidGetUserName] = useState(false);
  const [inputText, setInputText] = useState("");
  const textArea = useRef();

  const typingUserName = () => {
    const typedText = textArea.current.value;

    setInputText(typedText);
  };

  return (
    <>
      {didGetUserName ? (
        <>
          <JoinGame userName={inputText} isCreator={false} />
          <MultiplayerChessGameComponent myUserName={inputText} />
        </>
      ) : (
        <div>
          <h1>Your Username:</h1>

          <input ref={textArea} onInput={typingUserName}></input>

          <button
            className=""
            disabled={!(inputText.length > 0)}
            onClick={() => {
              setDidGetUserName(true);
            }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default JoinRoom;
