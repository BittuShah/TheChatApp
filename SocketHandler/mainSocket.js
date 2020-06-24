// Helper Libraries
const {
  FindOneOrganizationUser,
  FindOnePersonalUser,
  FindGroupChat,
  FindUserChat,
  FindCollections,
  FindPendingMessages,
  FindGroups,
} = require("../MongoDB/Helpers/findingHelper");
const {
  UpdateOrganizationUsers,
} = require("../MongoDB/Helpers/updatingHelper");
const { DeletePendingMessages } = require("../MongoDB/Helpers/deletingHelper");
const { CreatePendingMessage } = require("../MongoDB/Helpers/savingHelper");
const { CreateChatMsg } = require("../MongoDB/Helpers/savingHelper");
const { RenderMessages } = require("./Helpers/renderMessages");
const { NotifyForDelivered, NotifyForSeen } = require("./Helpers/notifyHelper");
// const { GetCollection } = require("./Helpers/collectionFinder");
const { FormatMessage, FormatLastSeen } = require("../utils/messages");
const convertJWTToken = require("../utils/convertToken");

// External Libraries
const _ = require("lodash");
// const moment = require("moment");

const connectedUser = {};

const userCustomerId = {};

let converted;

function mainSocket(io) {
  io.on("connection", (socket) => {
    socket.on("forDB", async (token) => {
      try {
        converted = convertJWTToken(token);
        connectedUser[converted._id] = socket.id;
        userCustomerId[converted._id] = converted.CustomerId;

        const PendingMessages = await FindPendingMessages(
          converted.CustomerId,
          { ReceiverId: converted._id }
        );

        NotifyForDelivered(io, PendingMessages, connectedUser);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("openChat", async (buildObj, callback) => {
      const tokenConvert = convertJWTToken(buildObj.token);

      let allMessages = [];

      if (buildObj.isGroup == true) {
        socket.join(buildObj._id);

        let roomDetails = io.sockets.adapter.sids;

        const usersIds = connectedUser[tokenConvert._id];

        let roomIds = Object.keys(roomDetails[usersIds]);

        for (let i = 0; i < roomIds.length; i++) {
          if (
            buildObj._id == roomIds[i] ||
            connectedUser[tokenConvert._id] == roomIds[i]
          ) {
            continue;
          } else {
            socket.leave(roomIds[i]);
          }
        }

        allMessages = await FindGroupChat(
          tokenConvert.CustomerId,
          buildObj._id
        );

        RenderMessages(socket, allMessages, tokenConvert.CustomerId);

        const groupAdmin = await FindGroups(tokenConvert.CustomerId, {
          _id: buildObj._id,
        });

        const verifyAdmin =
          groupAdmin[0].UserId == tokenConvert._id
            ? { isAdmin: true }
            : { isAdmin: false };

        callback(verifyAdmin);
      } else {
        socket.join(buildObj.Details._id);

        let roomDetails = io.sockets.adapter.sids;

        const usersIds = connectedUser[tokenConvert._id];

        let roomIds = Object.keys(roomDetails[usersIds]);

        for (let i = 0; i < roomIds.length; i++) {
          if (
            buildObj.Details._id == roomIds[i] ||
            connectedUser[tokenConvert._id] == roomIds[i]
          ) {
            continue;
          } else {
            socket.leave(roomIds[i]);
          }
        }

        // roomDetails = io.sockets.adapter.sids;

        // userIds = connectedUser[tokenConvert._id];

        // roomIds = Object.keys(roomDetails[usersIds])[0];

        const deletedMsg = await DeletePendingMessages(
          tokenConvert.CustomerId,
          {
            ReceiverId: tokenConvert._id,
            SenderId: buildObj.Details._id,
          }
        );

        NotifyForSeen(io, deletedMsg, connectedUser);

        const tryArr = [
          tokenConvert._id + "_" + buildObj.Details._id,
          buildObj.Details._id + "_" + tokenConvert._id,
        ];

        const collectionName = await FindCollections(
          tokenConvert.CustomerId,
          tryArr
        );

        allMessages = await FindUserChat(
          tokenConvert.CustomerId,
          collectionName
        );

        RenderMessages(
          socket,
          allMessages,
          tokenConvert.CustomerId,
          tokenConvert._id,
          buildObj.Details._id
        );

        // FindCollections(tokenConvert.CustomerId, tryArr)
        //   .then(async (theArray) => {
        //     for (let i = 0; i < tryArr.length; i++) {
        //       const isCollection = theArray.indexOf(tryArr[i]);

        //       if (isCollection != -1) {
        //         allMessages = await FindUserChat(
        //           tokenConvert.CustomerId,
        //           tryArr[i]
        //         );

        //         RenderMessages(
        //           socket,
        //           allMessages,
        //           tokenConvert.CustomerId,
        //           tokenConvert._id,
        //           buildObj.Details._id
        //         );
        //         break;
        //       } else {
        //         continue;
        //       }
        //     }
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });

        // console.log("Build Obj: ", buildObj);

        // FindOneOrganizationUser({_id: buildObj.UserId})

        // For updating Message's status

        //   const UpdateMsgObj = {};

        // socket.emit("updateMessage", deletedMsg);

        const forLastSeen = await FindOneOrganizationUser({
          _id: buildObj._id,
        });

        if (forLastSeen.isActive) {
          callback({ isActive: forLastSeen.isActive });
        } else {
          const DateTime = FormatLastSeen(forLastSeen.LastSeen);

          callback({ isActive: DateTime });
        }
      }
    });

    // Listen for chatMessage
    socket.on("chatMessage", async function (uOrg, callback) {
      const tokenConvert = convertJWTToken(uOrg.token);

      if (uOrg.isGroup) {
        socket.join(uOrg._id);

        const savedMsg = await CreateChatMsg(
          tokenConvert.CustomerId,
          uOrg._id,
          uOrg.isGroup,
          tokenConvert._id,
          uOrg.Message
        );

        const userName = await FindOneOrganizationUser({
          _id: tokenConvert.UserId,
        });

        io.to(uOrg._id).emit(
          "message",
          FormatMessage(
            savedMsg._id,
            userName.Name,
            savedMsg.Message,
            savedMsg.CreatedAt
          )
        );
      } else {
        let collectionName;

        const firstTry = tokenConvert._id + "_" + uOrg.Details._id;

        const secondTry = uOrg.Details._id + "_" + tokenConvert._id;

        const tryArr = [firstTry, secondTry];

        collectionName = await FindCollections(tokenConvert.CustomerId, tryArr);

        if (!collectionName) {
          collectionName = firstTry;
        }

        try {
          const savedMsg = await CreateChatMsg(
            tokenConvert.CustomerId,
            collectionName,
            uOrg.isGroup,
            tokenConvert._id,
            uOrg.Message,
            uOrg.Details._id
          );

          const userName = await FindOneOrganizationUser({
            _id: tokenConvert.UserId,
          });

          let isSeen = false;
          let isDelivered = false;

          const isLogged = await FindOneOrganizationUser({ _id: uOrg._id });

          if (isLogged.isActive) {
            isDelivered = true;
            let roomDetails = {};
            roomDetails = io.sockets.adapter.sids;

            const usersIds = connectedUser[uOrg.Details._id];

            let roomIds = [];

            if (usersIds) {
              roomIds = Object.keys(roomDetails[usersIds]);
            }

            let doSend = false;

            for (let i = 0; i < roomIds.length; i++) {
              if (roomIds[i] == tokenConvert._id) {
                doSend = true;
              }
            }

            if (doSend) {
              isSeen = true;
              // Receiver
              io.to(connectedUser[uOrg.Details._id]).emit(
                "message",
                FormatMessage(
                  savedMsg._id,
                  userName.Name,
                  savedMsg.Message,
                  savedMsg.CreatedAt,
                  true,
                  false
                )
              );

              io.to(connectedUser[uOrg.Details._id]).emit("updatePreviewMsg", {
                id: tokenConvert.UserId,
                Message: savedMsg.Message,
              });
            } else {
              isSeen = false;
              const savedPendingMsg = await CreatePendingMessage(
                tokenConvert.CustomerId,
                tokenConvert._id,
                uOrg.Details._id,
                savedMsg._id,
                true
              );

              const PendingCount = await FindPendingMessages(
                tokenConvert.CustomerId,
                { SenderId: tokenConvert._id, ReceiverId: uOrg.Details._id }
              );

              io.to(connectedUser[uOrg.Details._id]).emit("updatePreviewMsg", {
                id: tokenConvert.UserId,
                Message: savedMsg.Message,
                count: PendingCount.length,
              });
            }
          } else {
            isDelivered = false;
            const savedPendingMsg = await CreatePendingMessage(
              tokenConvert.CustomerId,
              tokenConvert._id,
              uOrg.Details._id,
              savedMsg._id,
              false
            );

            // io.to(connectedUser[tokenConvert._id]).emit("updatePreviewMsg", {
            //   id: uOrg._id,
            //   Message: savedMsg.Message,
            // });
          }

          // Sender
          io.to(connectedUser[tokenConvert._id]).emit(
            "message",
            FormatMessage(
              savedMsg._id,
              userName.Name,
              savedMsg.Message,
              savedMsg.CreatedAt,
              isSeen,
              isDelivered,
              true
            )
          );

          io.to(connectedUser[tokenConvert._id]).emit("updatePreviewMsg", {
            id: uOrg._id,
            Message: savedMsg.Message,
          });
        } catch (error) {
          console.log(error);
        }

        //   FindCollections(tokenConvert.CustomerId)
        //     .then(async (theArray) => {
        //       for (let i = 0; i < tryArr.length; i++) {
        //         const isCollection = theArray.indexOf(tryArr[i]);

        //         if (isCollection != -1) {
        //           collName = tryArr[i];
        //           break;
        //         } else {
        //           continue;
        //         }
        //       }

        //       if (!collName) {
        //         collName = firstTry;
        //       }

        //       try {
        //         const savedMsg = await CreateChatMsg(
        //           tokenConvert.CustomerId,
        //           collName,
        //           uOrg.isGroup,
        //           tokenConvert._id,
        //           uOrg.Message,
        //           uOrg.Details._id
        //         );

        //         const userName = await FindOneOrganizationUser({
        //           _id: tokenConvert.UserId,
        //         });

        //         let isSeen = false;
        //         let isDelivered = false;

        //         const isLogged = await FindOneOrganizationUser({ _id: uOrg._id });

        //         if (isLogged.isActive) {
        //           isDelivered = true;
        //           let roomDetails = {};
        //           roomDetails = io.sockets.adapter.sids;

        //           const usersIds = connectedUser[uOrg.Details._id];

        //           let roomIds = [];

        //           if (usersIds) {
        //             roomIds = Object.keys(roomDetails[usersIds]);
        //           }

        //           let doSend = false;

        //           for (let i = 0; i < roomIds.length; i++) {
        //             if (roomIds[i] == tokenConvert._id) {
        //               doSend = true;
        //             }
        //           }

        //           if (doSend) {
        //             isSeen = true;
        //             // Receiver
        //             io.to(connectedUser[uOrg.Details._id]).emit(
        //               "message",
        //               FormatMessage(
        //                 savedMsg._id,
        //                 userName.Name,
        //                 savedMsg.Message,
        //                 savedMsg.CreatedAt,
        //                 true,
        //                 false
        //               )
        //             );
        //           } else {
        //             isSeen = false;
        //             const savedPendingMsg = await CreatePendingMessage(
        //               tokenConvert.CustomerId,
        //               tokenConvert._id,
        //               uOrg.Details._id,
        //               savedMsg._id,
        //               true
        //             );
        //           }
        //         } else {
        //           isDelivered = false;
        //           const savedPendingMsg = await CreatePendingMessage(
        //             tokenConvert.CustomerId,
        //             tokenConvert._id,
        //             uOrg.Details._id,
        //             savedMsg._id,
        //             false
        //           );
        //         }

        //         // Sender
        //         io.to(connectedUser[tokenConvert._id]).emit(
        //           "message",
        //           FormatMessage(
        //             savedMsg._id,
        //             userName.Name,
        //             savedMsg.Message,
        //             savedMsg.CreatedAt,
        //             isSeen,
        //             isDelivered,
        //             true
        //           )
        //         );
        //       } catch (error) {
        //         console.log(error);
        //       }
        //     })
        //     .catch((error) => {
        //       console.log(error);
        //     });
      }

      callback("Received Message!");
    });

    // Runs when client disconnects
    socket.on("disconnect", async () => {
      let copyConnectedUser = connectedUser;
      copyConnectedUser = _.invert(copyConnectedUser);

      try {
        const personalUser = await FindOnePersonalUser(
          userCustomerId[copyConnectedUser[socket.id]],
          {
            _id: copyConnectedUser[socket.id],
          }
        );

        // const OrgUser = await FindOneOrganizationUser({
        //   _id: personalUser.UserId,
        // });

        await UpdateOrganizationUsers(
          { _id: personalUser.UserId },
          { isActive: false, LastSeen: new Date() }
        );
      } catch (error) {
        console.log(error);
      }

      // io.emit(
      //   "message",
      //   FormatMessage(
      //     copyConnectedUser[socket.id],
      //     "A user has left the ChatApp!",
      //     moment().utc().format("h:mm A")
      //   )
      // );
    });
  });
}

module.exports = mainSocket;
