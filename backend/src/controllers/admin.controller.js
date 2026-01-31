const userModel = require("../models/user.model");

// GET /admin/users
async function listUsers(req, res) {
  try {
    const users = await userModel.listUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("admin listUsers error:", err);
    return res.status(500).json({ success: false, error: { message: "Server error" } });
  }
}

// PATCH /admin/users/:id/activate
async function activateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid user id" } });
    }

    const result = await userModel.setActive(id, 1);
    if (result.updated === 0) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    return res.status(200).json({ success: true, message: "User activated" });
  } catch (err) {
    console.error("admin activateUser error:", err);
    return res.status(500).json({ success: false, error: { message: "Server error" } });
  }
}

// PATCH /admin/users/:id/deactivate
async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid user id" } });
    }

    const result = await userModel.setActive(id, 0);
    if (result.updated === 0) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    return res.status(200).json({ success: true, message: "User deactivated" });
  } catch (err) {
    console.error("admin deactivateUser error:", err);
    return res.status(500).json({ success: false, error: { message: "Server error" } });
  }
}

module.exports = {
  listUsers,
  activateUser,
  deactivateUser,
};
