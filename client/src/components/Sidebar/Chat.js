import React, { useEffect, useState } from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { updateConversations } from "../../store/utils/thunkCreators";
import { connect } from "react-redux";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab"
    }
  }
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation, activeConversation, updateConversations } = props;
  const { otherUser, userActive, messages } = conversation;

  const [ unreadMsgs, setUnreadMsgs ] = useState(0);

  useEffect(() => {
    if(activeConversation === otherUser.username) {
      // console.log("use Effect in sidebar\n");
      setUnreadMsgs(0);
      updateConversations({conversationId: conversation.id});

    } else {
      const msgs  = (() => {
        let count = 0;
        // userActive time will be undefined for new convo
        // subtracting 1 year from the date will ensure that the second if condition is met
        let datetime = userActive ? moment(userActive) : moment().subtract(1, 'y');
        messages.forEach((convo) => {
          if(convo.senderId === otherUser.id && moment(convo.createdAt).isAfter(datetime)) {
            count++;
          }
        });
        return count;
      })();
      setUnreadMsgs(msgs);
    }
  }, [messages, otherUser.id, activeConversation, otherUser.username, conversation.id]);


  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} unreadMsgs={unreadMsgs} />
      <Badge
        badgeContent={unreadMsgs}
        color="primary"
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    updateConversations: (data) => {
      dispatch(updateConversations(data));
    },
  };
};

export default connect(null, mapDispatchToProps)(Chat);
