const express = require("express");
const router = express.Router();

const { 
  getMessages, 
  deleteForMe, 
  deleteForEveryone 
} = require("../controllers/messageController");


router.get("/:senderId/:receiverId", getMessages);

router.delete("/delete-for-me", deleteForMe);

router.delete("/delete-for-everyone", deleteForEveryone);


module.exports = router;
