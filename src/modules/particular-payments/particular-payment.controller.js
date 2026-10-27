import {
  getPaymentStatus,
  markAsPaid,
} from "./particular-payment.service.js";

export async function getPaymentStatusController(req, res) {
  try {
    const { patientId } = req.params;
    const status = await getPaymentStatus(patientId);
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function markAsPaidController(req, res) {
  try {
    const { patientId } = req.params;
    const { cycles } = req.body || {};
    const status = await markAsPaid(patientId, cycles);
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
