const bcrypt = require('bcrypt');
const fsPromises = require('fs').promises;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

const usersDB = {
  users: require('../model/users.json'),
  setUsers(data) {
    this.users = data;
  },
};

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
  }

  const foundUser = usersDB.users.find(person => person.username === user);

  if (!foundUser) {
    return res.sendStatus(401);
  }

  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '5m',
      },
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' },
    );

    // Save refresh token with user
    const otherUsers = usersDB.users.filter(
      person => person.username !== foundUser.username,
    );
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(usersDB.users),
    );

    // These keeps refresh token from js - not available for js in front-end
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
