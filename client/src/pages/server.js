socket.on("deleteMessage", async (messageId) => {

  console.log("DELETE REQUEST:", messageId);

  try {

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        text: "This message was deleted",
        deletedForEveryone: true
      },
      { new: true }
    );


    console.log("UPDATED MESSAGE:", updatedMessage);


    if(updatedMessage){

      // 👇 YAHAN ADD KARNA HAI

      io.to(updatedMessage.receiver).emit(
        "messageDeleted",
        updatedMessage
      );


      io.to(updatedMessage.sender).emit(
        "messageDeleted",
        updatedMessage
      );

    }


  } catch(error){

    console.log("DELETE ERROR:", error);

  }

});
