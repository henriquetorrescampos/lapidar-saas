import { login, getMe } from "./auth.service.js";

export async function loginController(req, res) {
  try {
    const token = await login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getMeController(req, res) {
  try {
    const user = await getMe(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
