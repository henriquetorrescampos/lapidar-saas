export function getPatientAge(birthDate) {
  if (!birthDate) return null;

  const dateOfBirth = new Date(birthDate);

  if (Number.isNaN(dateOfBirth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}
