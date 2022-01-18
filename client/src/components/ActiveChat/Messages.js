import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";


const Messages = (props) => {
  const { messages, otherUser, userId, otherUserActiveTime } = props;
  const [idx, setIdx ] = useState(-1);

  useEffect(() => {
    let userTime = otherUserActiveTime ?  moment(otherUserActiveTime) : moment().subtract(1, 'y');
    for(let i = messages.length-1; i >= 0; --i) {
      const msgTime = moment(messages[i].createdAt)
      if (messages[i].senderId === userId && userTime.isAfter(msgTime)) {
        setIdx(i);
        break;
      }
      else if (messages[i].senderId !== userId && msgTime.isAfter(userTime)) {
        userTime = msgTime;
      }
    }
  }, [messages, userId, otherUserActiveTime]);

  return (
    <Box>
      {messages.map((message, index) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
            <SenderBubble key={message.id} text={message.text} time={time} otherUser={otherUser} draw={index === idx}/>
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
