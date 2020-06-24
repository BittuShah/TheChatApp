function notifyForDelivered(io, msgArray, connectedUsers) {
  for (let i = 0; i < msgArray.length; i++) {
    io.to(connectedUsers[msgArray[i].SenderId]).emit(
      "changeStatus",
      msgArray[i]
    );
  }

  //   socket.emit("changeStatus", msgArray);
}

function notifyForSeen(io, msgArray, connectedUsers) {
  for (let i = 0; i < msgArray.length; i++) {
    const modyfiedObj = { isSeen: true, ...msgArray[i]._doc };
    io.to(connectedUsers[msgArray[i].SenderId]).emit(
      "changeStatus",
      modyfiedObj
    );
  }
}

module.exports.NotifyForDelivered = notifyForDelivered;
module.exports.NotifyForSeen = notifyForSeen;
