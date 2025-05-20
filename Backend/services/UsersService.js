import users from "../models/users.js"; 

class UsersService {
  static getAllUsers() {
    return users;
  }

  static getUserById(id) {
    return users.find((user) => user.id === parseInt(id, 10));
  }

  static createUser(data) {
    const newUser = {
      id: users.length + 1,
      ...data,
    };
    users.push(newUser);
    return newUser;
  }

  static updateUser(id, data) {
    const index = users.findIndex((user) => user.id === parseInt(id, 10));
    if (index === -1) return null;

    users[index] = { ...users[index], ...data };
    return users[index];
  }

  static deleteUser(id) {
    const index = users.findIndex((user) => user.id === parseInt(id, 10));
    if (index === -1) return null;

    const [deleted] = users.splice(index, 1);
    return deleted;
  }
}

export default UsersService;
