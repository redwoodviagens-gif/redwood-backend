import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('📥 BODY RECEBIDO:', req.body);

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1
    } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes',
        required: ['origin', 'destination', 'departureDate']
      });
    }

    const response = await axios.post(
      'https://api.duffel.com/air/offer_requests',
      {
        slices: [
          {
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
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
          Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json'
        }
      }
    );

    const offers = response.data?.data?.offers || [];

    console.log('✈️ VOOS ENCONTRADOS:', offers.length);

    return res.json({
      success: true,
      total: offers.length,
      flights: offers
    });

  } catch (error) {
    console.error('❌ ERRO DUFFEL:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar voos',
      details: error.response?.data || error.message
    });
  }
});

export default router;
