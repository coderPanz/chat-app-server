const Message = require("../models/message");
const User = require('../models/user')
const connectToDB = require("../utils/connect-database/connect-database");
const path = require("path");
const { renameSync } = require("fs");
const uploadDir = path.join(__dirname, "../public/uploads/images/");

const uploadImg = async (req, res) => {
  try {
    if (req.file) {
      const { fromId, toId } = req.query;
      const date = Date.now();
      let fileName = uploadDir + date + req.file.originalname;
      // 获取 `date + req.file.originalname` 这一部分
      // 这个是需要保存在数据库的文件名
      let dateAndName = fileName.slice(uploadDir.length); 
      renameSync(req.file.path, fileName);
      await connectToDB();

      if (fromId && toId) {
        // message字段为fileName, type字段为image
        const message = await Message.create({
          message: dateAndName,
          sender: fromId,
          receiver: toId,
          type: "image",
        });

        // 把消息_id保存到用户的收发消息列表中
        const userFrom = await User.findById(fromId);
        const userTo = await User.findById(toId);

        userFrom.sentMessages.push(message._id);
        await userFrom.save();
        userTo.recievedMessages.push(message._id);
        await userTo.save();

        return res.status(201).json({ message });
      } else {
        return res.status(400).send("找不到发送者和接收者!");
      }
    }
  } catch (error) {
    return res.status(500).send("发送图片发送异常!");
  }
};

module.exports = uploadImg;
