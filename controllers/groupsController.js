// groupController.js
const db = require("../database/index");

exports.createGroup = async (req, res) => {
  try {
    const { name, description, users } = req.body;

    // Insert the group into the groups table
    const insertGroupQuery =
      "INSERT INTO `groups` (name, description) VALUES (?, ?)";
    const [insertGroupResult] = await db.query(insertGroupQuery, [
      name,
      description,
    ]);

    const groupId = insertGroupResult.insertId;
    console.log(groupId);

    // Insert group-user mappings
    if (users && users.length > 0) {
      const insertMappingsQuery = `
          INSERT INTO \`group-user-mappings\` (groupId, userId)
          VALUES ${users.map((userId) => `(${groupId}, ${userId})`).join(", ")}
        `;
      await db.query(insertMappingsQuery);
    }

    res.status(201).json({ message: "Group created successfully", groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editGroup = async (req, res) => {
  try {
    const { groupId, name, description } = req.body;

    // Update the group in the groups table
    const updateGroupQuery =
      "UPDATE `groups` SET name = ?, description = ? WHERE id = ?";
    await db.query(updateGroupQuery, [name, description, groupId]);

    res.json({ message: "Group updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addGroupMembers = async (req, res) => {
  try {
    const { groupId, users } = req.body;

    // Insert group-user mappings
    if (users && users.length > 0) {
      const insertMappingsQuery =
        "INSERT INTO group_user_mappings (groupId, userId) VALUES (?, ?)";
      const mappingValues = users.map((userId) => [groupId, userId]);
      await db.query(insertMappingsQuery, mappingValues);
    }

    res.json({ message: "Group members added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
