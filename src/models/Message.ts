import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    messageId: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, expires: '3d' } // TTL index
  });
  
const Message = mongoose.model('Message', messageSchema);

export default Message;
