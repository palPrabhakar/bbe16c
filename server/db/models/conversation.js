const { Op } = require("sequelize");
const db = require("../db");
const Message = require("./message");

// To store the name of the group conversation
const Conversation = db.define("conversation", {
  name: {
    type: Sequelize.STRING,
  }
});

// find conversation given two user Ids

// This will need to change
Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
