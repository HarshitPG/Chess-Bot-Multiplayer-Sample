import io from "socket.io-client";

const URL = "http://localhost:8000";

const socket = io(URL);

var mySocketId;

socket.on("createNewGame", (statusUpdate) => {
  console.log(
    "A new game has been created! Username:" +
      statusUpdate.userName +
      "GameId:" +
      statusUpdate.gameId +
      "all status:" +
      statusUpdate.mySocketId
  );
  console.log(statusUpdate);
  mySocketId = statusUpdate.mySocketId;
});

export { socket, mySocketId };
