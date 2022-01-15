import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";


const Messages = (props) => {
  const { messages, otherUser, userId, otherUserActiveTime } = props;
  const [idx, updateIndex ] = useState(-1);

  useEffect(() => {
    let ut = moment(otherUserActiveTime)
    for(let i = messages.length-1; i >= 0; --i) {
      const mt = moment(messages[i].createdAt)
      if (messages[i].senderId === userId && ut.isAfter(mt)) {
        updateIndex(i);
        break;
      }
      else if (messages[i].senderId !== userId && mt.isAfter(ut)) {
        ut = mt;
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
