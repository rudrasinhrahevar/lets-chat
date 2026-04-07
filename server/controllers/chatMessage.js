import ChatMessage from "../models/ChatMessage.js";

export const createMessage = async (req, res) => {
  console.log('=== Creating new message ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const newMessage = new ChatMessage(req.body);

  try {
    const savedMessage = await newMessage.save();
    console.log('✅ Message saved successfully:', savedMessage._id);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('❌ Error creating message:', error.message);
    console.error('Error name:', error.name);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(409).json({
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      chatRoomId: req.params.chatRoomId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;
    
    console.log(`📖 Marking messages as read in chatRoom: ${chatRoomId} by user: ${userId}`);
    
    // First, let's see ALL messages in this chat room
    const allMessages = await ChatMessage.find({ chatRoomId });
    console.log(`📊 Total messages in chat room: ${allMessages.length}`);
    allMessages.forEach(msg => {
      console.log(`  - Msg ${msg._id}: sender=${msg.sender}, status=${msg.status}, readBy=${msg.readBy}, ${msg.attachment ? `[${msg.attachment.fileType}]` : msg.message.substring(0, 30)}`);
    });
    
    // Get the messages being marked as read to find the sender
    const messagesToUpdate = await ChatMessage.find({
      chatRoomId: chatRoomId,
      sender: { $ne: userId },
      readBy: { $ne: userId }
    });
    
    console.log(`📖 Found ${messagesToUpdate.length} messages to mark as read`);
    messagesToUpdate.forEach(msg => {
      console.log(`  - Message ${msg._id}: ${msg.attachment ? `[${msg.attachment.fileType}]` : msg.message.substring(0, 30)}`);
    });
    
    // Update messages
    const updateResult = await ChatMessage.updateMany(
      {
        chatRoomId: chatRoomId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $set: { status: 'read' },
        $addToSet: { readBy: userId }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} messages to read status`);
    
    // Emit socket event to notify the sender(s) that messages were read
    if (messagesToUpdate.length > 0 && global.io && global.onlineUsers) {
      const senderIds = [...new Set(messagesToUpdate.map(msg => msg.sender))];
      
      console.log(`📡 Emitting messagesRead to ${senderIds.length} sender(s)`);
      
      senderIds.forEach(senderId => {
        const senderSocket = global.onlineUsers.get(senderId);
        if (senderSocket) {
          console.log(`  ✉️  Emitting to sender ${senderId} (socket: ${senderSocket})`);
          global.io.to(senderSocket).emit("messagesRead", {
            chatRoomId,
            userId,
          });
        } else {
          console.log(`  ❌ Sender ${senderId} not online`);
        }
      });
    } else {
      console.log(`⚠️  No messages to update or socket not available`);
    }
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
