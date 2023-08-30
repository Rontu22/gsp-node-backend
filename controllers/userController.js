const db = require("../database/index");

exports.getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    // users table has all user details
    // we just need some particular details to be returned throught this api
    const [users] = await db.query("SELECT * FROM users LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error " });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.query;
    const [user] = await db.query("SELECT * FROM users WHERE id = ? limit 1", [
      id,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
