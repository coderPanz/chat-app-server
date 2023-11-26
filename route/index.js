const express = require('express')
const router = express.Router()
const uploadImgCtrl = require('../control/image-message.js')
const uploadAudioCtrl = require('../control/audio-message.js')
const multer = require('multer')
const path = require('path');

// 指定上传文件的存储路径
// 注意需要在存放目录的结尾加一个 '/'符号, 否则会在上一个目录下创建
const uploadImgDir = path.join(__dirname, '../public/uploads/images/');
const uploadAudioDir = path.join(__dirname, '../public/uploads/audios/');
const uploadImg = multer({ dest: uploadImgDir })
const uploadAudio = multer({ dest: uploadAudioDir })

router.post("/sent-message/image-message", uploadImg.single('image'), uploadImgCtrl);
router.post("/sent-message/audio-message", uploadAudio.single('audio'), uploadAudioCtrl)


module.exports = router;
