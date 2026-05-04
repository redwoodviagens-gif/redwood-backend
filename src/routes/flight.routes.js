import express from 'express';
import axios from 'axios';
import { env } from '../config/env.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1
    } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes'
      });
    }

    const response = await axios.post(
      'https://api.duffel.com/air/offer_requests',
      {
        slices: [
          {
            origin,
            destination,
            departure_date: departureDate
          }
        ],
        passengers: Array.from({ length: adults }, () => ({
          type: 'adult'
        })),
        cabin_class: 'economy'
      },
      {
        headers: {
          Authorization: `Bearer ${env.DUFFEL_ACCESS_TOKEN}`,
          'Duffel-Version': 'v1',
          'Content-Type': 'application/json'
        }
      }
    );

    const offers = response.data.data.offers;

    return res.json({
      success: true,
      flights: offers
    });

  } catch (error) {
    console.error('ERRO DUFFEL:', error.response?.data || error.message);

    return res.status(500).json({
      error: 'Erro ao buscar voos',
      details: error.response?.data || error.message
    });
  }
});

export default router;
