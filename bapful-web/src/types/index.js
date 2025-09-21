// User interface
export const createUser = (id, email, name, createdAt = null) => ({
  id,
  email,
  name,
  createdAt
});

// Login response interface
export const createLoginResponse = (access_token, token_type, user) => ({
  access_token,
  token_type,
  user
});

// Register request interface
export const createRegisterRequest = (email, password, name) => ({
  email,
  password,
  name
});

// Login request interface
export const createLoginRequest = (email, password) => ({
  email,
  password
});

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim());
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name?.trim() && name.trim().length >= 2;
};
