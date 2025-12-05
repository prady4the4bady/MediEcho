import jwt from "jsonwebtoken";

// Parse and clean environment variables (remove any whitespace/newlines)
const getJwtExpire = () => {
  const expire = process.env.JWT_EXPIRE;
  return expire ? expire.trim() : "15m";
};

const getRefreshExpire = () => {
  const expire = process.env.REFRESH_TOKEN_EXPIRE;
  return expire ? expire.trim() : "7d";
};

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: getJwtExpire()
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: getRefreshExpire()
  });
};