import { createUser, getUsers, deleteUser } from "./user.service.js";

// CREATE
export async function createUserController(req, res) {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// LIST
export async function getUsersController(req, res) {
  const users = await getUsers();
  res.json(users);
}

// DELETE
export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
