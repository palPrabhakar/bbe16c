const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "user1Active", "user2Active"],
      order: [[Message, "createdAt", "DESC"]],
      include: [
        { model: Message, order: ["createdAt", "DESC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        convoJSON.userActive = convoJSON.user2Active;
        convoJSON.otherUserActive = convoJSON.user1Active;
        delete convoJSON.user1;
        delete convoJSON.user1Active;
        delete convoJSON.user2Active;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        convoJSON.userActive = convoJSON.user1Active;
        convoJSON.otherUserActive = convoJSON.user2Active;
        delete convoJSON.user2;
        delete convoJSON.user1Active;
        delete convoJSON.user2Active;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[0].text;
      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put("/updateTime/", async(req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { conversationId } = req.body;

    let conversation = await Conversation.findOne({
      where:{
        id: conversationId
      }
    });

    if(conversation.user1Id === req.user.id) {
      conversation.user1Active = new Date();
    }
    else {
      conversation.user2Active = new Date();
    }

    await conversation.save();

    if(conversation.user1Id === req.user.id) {
      res.json({id: conversationId, userActive: conversation.user1Active, otherUserActive: conversation.user2Active});
    }
    else {
      res.json({id: conversationId, otherUserActive: conversation.user1Active, userActive: conversation.user2Active});
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
