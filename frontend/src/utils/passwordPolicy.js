export const isStrongPassword = (password = '') =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);
