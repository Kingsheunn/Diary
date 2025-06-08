import UsersService from "../services/UsersService.js";
import validateSignIn from "../validators/validateSignIn.js";
import validateSignUp from "../validators/validateSignUp.js";
import validateUser from "../validators/validateUser.js";
import { validateReminder } from "../validators/validateReminder.js";

class UsersController {
  static async signIn(req, res) {
    const { error } = validateSignIn(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const result = await UsersService.signIn(req.body.email, req.body.password);
    if (!result)
      return res.status(401).json({ message: "Invalid email or password" });

    res.header("x-auth-token", result.token).status(200).json({
      user: result.user,
      message: "Login successful",
      token: result.token,
    });
  }

  static async signUp(req, res) {
    const { error } = validateSignUp(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const result = await UsersService.signUp(req.body);
    if (!result)
      return res.status(409).json({ message: "User already exists" });

    res.header("x-auth-token", result.token).status(201).json({
      user: result.user,
      message: "Account created successfully",
      token: result.token,
    });
  }

  static async getUser(req, res) {
    const user = await UsersService.getUser(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      email: user.email,
      name: user.name,
      message: "User details retrieved successfully",
    });
  }

  static async updateUser(req, res) {
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await UsersService.updateUser(req.body.name, req.body.email, req.user.id);

    res.status(200).json({ message: "Profile updated successfully" });
  }

  static async setReminder(req, res) {
    const { error } = validateReminder(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await UsersService.setReminder(req.user.id, req.body.remind);

    res.status(200).json({ message: "Reminder set successfully" });
  }

  static async getReminder(req, res) {
    const reminderData = await UsersService.getReminder(req.user.id);

    res.status(200).json({
      time: [{ reminder: reminderData.reminder }], // Format expected by test
    });
  }
}

export default UsersController;
