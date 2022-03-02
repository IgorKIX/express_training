/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const fsPromises = require('fs').promises;
const path = require('path');
const usersDB = {
  users: require('../model/users.json'),
  setUsers(data) {
    this.users = data;
  },
};

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
  }
  // check for duplicates of username
  const duplicate = usersDB.users.find(person => person.username === user);
  if (duplicate) {
    return res.sendStatus(409);
  }

  try {
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const newUser = { username: user, password: hashedPwd };
    usersDB.setUsers([...usersDB.users, newUser]);

    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(usersDB.users),
    );
    console.log(usersDB.users);
    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };

/* eslint-enable no-console */
