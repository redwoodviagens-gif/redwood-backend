import { saveLead } from '../services/lead.service.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export async function saveLeadController(req, res, next) {
  try {
    const payload = req.body;
    const result = await saveLead(payload);
    const whatsappLink = buildWhatsAppLink(payload);
    res.status(201).json({ ...result, whatsappLink });
  } catch (err) {
    next(err);
  }
}
