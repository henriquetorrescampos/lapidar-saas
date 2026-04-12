// Validações centralizada para o projeto

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
}

export function validatePassword(password) {
  if (!password) {
    throw new Error("Password is required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && !value.trim())) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
}

export function validateNumberId(id) {
  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid ID");
  }
  return numId;
}

export function validateRoles(roles) {
  const validRoles = ["admin", "user"];
  if (!Array.isArray(roles)) {
    throw new Error("Roles must be an array");
  }
  for (const role of roles) {
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
  }
}
