import React, { useCallback, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ColorContext } from "./context/colorMultiplayer/colorContext";
import Onboard from "./components/onboard/onboard";
import JoinGame from "./components/joinGame/joinGame";
import JoinRoom from "./components/joinroom/joinroom";
import Home from "./pages/home/home";
import ChessBot from "./pages/chessBot/chessBot";
import MultiplayerChessComponent from "./components/multiplayerChessBoard/multiplayerChess";

function App() {
  const [didRedirect, setDidRedirect] = useState(false);

  const playerDidRedirect = useCallback(() => {
    setDidRedirect(true);
  }, []);

  const playerDidNotRedirect = useCallback(() => {
    setDidRedirect(false);
  }, []);

  const [userName, setUserName] = useState("");
  console.log(didRedirect);

  return (
    <ColorContext.Provider
      value={{
        didRedirect: didRedirect,
        playerDidRedirect: playerDidRedirect,
        playerDidNotRedirect: playerDidNotRedirect,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/PlayWithAI" element={<ChessBot />} />
          <Route
            path="/MultiPlayer"
            element={<Onboard setUserName={setUserName} />}
          />
          <Route
            path="/game/:gameid"
            element={
              didRedirect ? (
                <>
                  <JoinGame userName={userName} isCreator={true} />
                  <MultiplayerChessComponent userName={userName} />
                </>
              ) : (
                <JoinRoom />
              )
            }
          />
        </Routes>
      </Router>
    </ColorContext.Provider>
  );
}

export default App;
