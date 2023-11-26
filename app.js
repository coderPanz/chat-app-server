const express = require("express"); // 导入 express 模块
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const uploadRoute = require("./route/index.js");
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname,'./public/uploads/audios')))
app.use(express.static(path.join(__dirname,'./public/uploads/images')))

app.use(cors());
// 1. 用于解析 HTTP 请求中的表单数据
app.use(express.urlencoded({ extended: false }));
// 2. 用于解析 HTTP 请求中的 JSON 格式的数据
app.use(bodyParser.json());
app.use("/express", uploadRoute);

const server = app.listen(5000, () => {
  console.log("服务启动成功!");
});

// 创建实时连接
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 记录实时在线用户
const onlineUsers = new Map();

io.on("connection", async (socket) => {
  // 用户上线后保存 socket.id 建立用户与 socket.id 的映射关系
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    // 广播给所有人(自己除外)
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  // 退出登录
  socket.on("login-out", (userId) => {
    onlineUsers.delete(userId);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys())
    })
  });

  // 监听好友发送的消息到指定的房间发送消息
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.receiver);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", { ...data });
    }
  });

  // 通话socket
  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.toId);
    socket.to(sendUserSocket).emit("incoming-voice-call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.toId);
    socket.to(sendUserSocket).emit("incoming-video-call", {
      from: data.from,
      roomId: data.roomId,
      callType: data.callType,
    });
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.fromId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected", data);
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.fromId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected", data);
    }
  });

  socket.on("accept-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data._id);
    socket.to(sendUserSocket).emit("voice-call-accepted");
  });

  socket.on("accept-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data._id);
    socket.to(sendUserSocket).emit("video-call-accepted");
  });

  // 添加好友
  socket.on('add-friend', (data) => {
    const sendUserSocket = onlineUsers.get(data.friendId);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit('add-friend-req', data)
    }
  })

  // 申请被同意
  socket.on('accept-req', (data) => {
    const sendUserSocket = onlineUsers.get(data.toId);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit('accept-reqed', data)
    }
  })
  // 拒绝申请
  socket.on('reject-add', (data) => {
    const sendUserSocket = onlineUsers.get(data.toId);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit('add-rejected', data)
    }
  })
});
