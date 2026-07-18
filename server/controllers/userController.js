const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find({}, "-password");

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};
