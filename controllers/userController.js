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
    const countQuery = "SELECT COUNT(*) as count FROM users";
    const [count] = await db.query(countQuery);
    const total = count[0].count;
    res.json({ users, total });
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

exports.getUserStatus = async (req, res) => {
  try {
    const id = parseInt(req?.query?.id);
    const [user] = await db.query(
      "SELECT role FROM users u join admin_users on u.mobile = admin_users.mobile WHERE u.id = ? limit 1",
      [id]
    );
    if (user.length === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    return res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error in getUserStatus: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
