import { Router } from 'express';
import { searchFlightsController } from '../controllers/flight.controller.js';
const router = Router();
router.get('/search', searchFlightsController);
export default router;
