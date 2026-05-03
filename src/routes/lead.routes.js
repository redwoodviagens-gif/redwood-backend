import { Router } from 'express';
import { saveLeadController } from '../controllers/lead.controller.js';
const router = Router();
router.post('/', saveLeadController);
export default router;
