const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

module.exports = generateTokens;