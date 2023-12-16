var io;
var gameSocket;
var gamesInSession = [];

const initializeGame = (sio, socket) => {
  io = sio;
  gameSocket = socket;

  gamesInSession.push(gameSocket);

  gameSocket.on("disconnect", onDisconnect);

  gameSocket.on("new move", newMove);

  gameSocket.on("createNewGame", createNewGame);

  gameSocket.on("playerJoinGame", playerJoinsGame);

  gameSocket.on("request username", requestUserName);

  gameSocket.on("recieved userName", recievedUserName);
};
function playerJoinsGame(idData) {
  var sock = this;
  var rooms = io.of("/").adapter.rooms;
  var room = rooms.get(idData.gameId);
  console.log(idData);

  if (room) {
    if (room.size < 2) {
      idData.mySocketId = sock.id;
      sock.join(idData.gameId);
      console.log(room.size);
      io.sockets.in(idData.gameId).emit("playerJoinedRoom", idData);
      if (room.size === 2) {
        io.sockets.in(idData.gameId).emit("start game", idData.userName);
      }
    } else {
      io.to(sock.id).emit(
        "status",
        "There are already 2 people playing in this room"
      );
      console.log("There are already 2 people playing in this room.");
    }
  } else {
    sock.emit("status", "This game session does not exist.");
  }
}

function createNewGame(gameId) {
  this.emit("createNewGame", { gameId: gameId, mySocketId: this.id });
  this.join(gameId);
}

function newMove(move) {
  const gameId = move.gameId;
  io.to(gameId).emit("opponent move", move);
  // console.log("move:", move);
}

function onDisconnect() {
  var i = gamesInSession.indexOf(gameSocket);
  gamesInSession.splice(i, 1);
}

function requestUserName(gameId) {
  io.to(gameId).emit("give userName", this.id);
}

function recievedUserName(data) {
  data.socketId = this.id;
  io.to(data.gameId).emit("get Opponent UserName", data);
}

exports.initializeGame = initializeGame;
