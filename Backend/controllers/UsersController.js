import UsersService from "../services/UsersService.js";
import { userSchema } from "../validators/userValidator.js";

class UsersController {
  static getAll(req, res) {
    const users = UsersService.getAllUsers();
    res.status(200).json(users);
  }

  static getById(req, res) {
    const user = UsersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  }

  static create(req, res) {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { name, age } = req.body;
    if (!name || !age) {
      return res.status(400).json({ message: "Name and age are required" });
    }

    const user = UsersService.createUser({ name, age });
    res.status(201).json(user);
  }

  static update(req, res) {
    const user = UsersService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  }

  static delete(req, res) {
    const user = UsersService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  }
}

export default UsersController;
