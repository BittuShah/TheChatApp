const router = require("express").Router();

// Helper Function
const {
  FindOneOrganizationUser,
  FindAllPersonalUsers,
  FindUserInGroup,
  FindGroups,
  FindUserChatSorted,
  FindPendingMessages,
  FindCollections,
  FindGroupChatSorted,
} = require("../MongoDB/Helpers/findingHelper");

const {
  UpdateOrganizationUsers,
} = require("../MongoDB/Helpers/updatingHelper");

// Authentication Middlolewares
const { AuthUser } = require("../middlewares/verifyToken");

// Helper libraries
const _ = require("lodash");

router.get("/ug", AuthUser, async (req, res) => {
  const resultObj = {};

  const userObj = [];

  const groupsObj = [];

  const usersGroup = await FindUserInGroup(req.user.CustomerId, {
    UserId: req.user._id,
  });

  const result = await FindAllPersonalUsers(req.user.CustomerId);

  const user = result.filter((result) => {
    return result.UserId !== req.user.UserId;
  });

  for (let i = 0; i < user.length; i++) {
    const just = await FindOneOrganizationUser({ _id: user[i].UserId });

    const justDoc = { ...just._doc };

    const justResult = { Details: user[i] };

    _.merge(justDoc, justResult);

    const tryArr = [
      req.user._id + "_" + user[i]._id,
      user[i]._id + "_" + req.user._id,
    ];

    const collectionName = await FindCollections(req.user.CustomerId, tryArr);

    const messages = await FindUserChatSorted(
      req.user.CustomerId,
      collectionName,
      { _id: -1 }
    );
    if (messages.length != 0) {
      const theMessage = { Preview: messages[0].Message };
      _.merge(justDoc, theMessage);
    }

    let PendingCount = 0;

    // const PendingMessage = await FindPendingMessages(req.user.CustomerId, {
    //   SenderId: req.user._id,
    //   ReceiverId: user[i]._id,
    // });

    const PendingMessageSecond = await FindPendingMessages(
      req.user.CustomerId,
      {
        ReceiverId: req.user._id,
        SenderId: user[i]._id,
      }
    );

    if (PendingMessageSecond.length != 0) {
      PendingCount = PendingMessageSecond.length;
    }
    // if (PendingMessage.length != 0) {
    //   PendingCount = PendingMessage.length;
    // } else {
    // }

    const pCount = { PendingCount: PendingCount };

    _.merge(justDoc, pCount);

    userObj.push(justDoc);
  }

  for (let j = 0; j < usersGroup.length; j++) {
    const groups = await FindGroups(req.user.CustomerId, {
      _id: usersGroup[j].GroupId,
    });

    // const messages = await FindGroupChatSorted(
    //   req.user.CustomerId,
    //   usersGroup[j].GroupId,
    //   { _id: -1 }
    // );

    // let theMessage;

    // if (messages.length != 0) {
    //   theMessage = { Preview: messages[0].Message };
    //   // _.merge(justDoc, theMessage);
    // }

    for (let i = 0; i < groups.length; i++) {
      const tempGrp = { ...groups[i]._doc };

      // console.log(tempGrp._id);

      const tryArr = [tempGrp._id];

      const collectionName = await FindCollections(req.user.CustomerId, tryArr);

      console.log(collectionName);

      const messages = await FindGroupChatSorted(
        req.user.CustomerId,
        collectionName,
        { _id: -1 }
      );

      let theMessage;

      if (messages.length != 0) {
        theMessage = { Preview: messages[0].Message };
        _.merge(tempGrp, theMessage);
      }

      groupsObj.push(tempGrp);
    }
  }

  await UpdateOrganizationUsers({ _id: req.user.UserId }, { isActive: true });

  resultObj.AllUsers = userObj;
  resultObj.Groups = groupsObj;

  res.status(200).send(resultObj);
});

module.exports = router;
