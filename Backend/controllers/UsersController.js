import UsersService from "../services/UsersService.js";
import { userSchema } from "../validators/userValidator.js";

class UsersController {
  static async getAll(req, res) {
    try {
      const users = await UsersService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const user = await UsersService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    try {
      const { name, email, password } = req.body;
      const user = await UsersService.createUser({ name, email, password });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const user = await UsersService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const user = await UsersService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default UsersController;
