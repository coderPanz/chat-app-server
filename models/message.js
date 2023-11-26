const mongoose = require('mongoose')
const { Schema, model, models }  = require('mongoose')

// 通过将 ref 的值修改为字符串 "User"，即使在模型导入的过程中，也能正常引用并建立与 Message 模型的关系。
const MessageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    default: "text"
  },
  message: {
    type: String,
  },
  messageStatus: {
    type: String,
    default: "sent" 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Message = models.Message || model('Message', MessageSchema);
module.exports = Message