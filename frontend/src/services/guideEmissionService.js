const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export const guideEmissionService = {
  getEmissions: async (month, year) => {
    const res = await fetch(
      `${API_URL}/guide-emissions?month=${month}&year=${year}`,
      { headers: getHeaders() }
    );
    return handleResponse(res);
  },

  toggle: async (patient_id, specialty, month, year) => {
    const res = await fetch(`${API_URL}/guide-emissions/toggle`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ patient_id, specialty, month, year }),
    });
    return handleResponse(res);
  },

  getPatientSchedules: async (patientId) => {
    const res = await fetch(
      `${API_URL}/guide-emissions/schedules/${patientId}`,
      { headers: getHeaders() }
    );
    return handleResponse(res);
  },

  upsertPatientSchedules: async (patientId, schedules) => {
    const res = await fetch(
      `${API_URL}/guide-emissions/schedules/${patientId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ schedules }),
      }
    );
    return handleResponse(res);
  },
};
