const db = require("../database/index");

exports.editProfile = async (req, res) => {
  try {
    const { name, address, state, pin, designation, dateOfBirth, id } =
      req.body;

    const editedData = await db.query(
      "UPDATE users SET name = ?, address = ?, state = ?, pin = ?, designation = ?, dateOfBirth = ? WHERE id = ?",
      [name, address, state, pin, designation, dateOfBirth, id]
    );

    if (editedData.affectedRows === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    return res.status(200).json({ message: "Profile edited successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error " });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const [user] = await db.query("SELECT * FROM users WHERE id = ? limit 1", [
      id,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    return res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error in getUserById: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
