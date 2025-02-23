const jwt = require('jsonwebtoken');
require('dotenv').config();

const usersDB = {
  users: require('../model/users.json'),
  setUsers(data) {
    this.users = data;
  },
};

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.sendStatus(401);
  }
  // eslint-disable-next-line no-console
  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;

  const foundUser = usersDB.users.find(
    person => person.refreshToken === refreshToken,
  );

  if (!foundUser) {
    return res.sendStatus(403); // forbidden
  }

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    const roles = Object.values(foundUser.roles);
    if (err || foundUser.username !== decoded.username) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' },
    );
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
