// Constantes da aplicação

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const SESSION_STATUS = {
  SCHEDULED: "scheduled",
  DONE: "done",
  CANCELLED: "cancelled",
};

export const FINANCE_TYPE = {
  ENTRADA: "entrada",
  SAIDA: "saida",
};

export const JWT_EXPIRES_IN = "1d";
export const BCRYPT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_SESSIONS_PER_SPECIALTY = 10;

export const MAX_SESSIONS_BY_PATIENT_TYPE = {
  ABA: 10,
  TERAPIA_ADULTO: 4,
};

export const MIN_SESSIONS_TO_ARCHIVE = {
  ABA: 8,
  TERAPIA_ADULTO: 4,
};

export function getMaxSessionsForPatientType(patientType) {
  if (patientType && patientType.includes("ABA")) {
    return MAX_SESSIONS_BY_PATIENT_TYPE.ABA;
  }
  if (patientType && patientType.includes("TERAPIA_ADULTO")) {
    return MAX_SESSIONS_BY_PATIENT_TYPE.TERAPIA_ADULTO;
  }
  return MAX_SESSIONS_PER_SPECIALTY;
}
