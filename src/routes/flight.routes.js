import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('BODY RECEBIDO:', req.body);

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

    const slices = [
      {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: departureDate
      }
    ];

    if (returnDate) {
      slices.push({
        origin: destination.toUpperCase(),
        destination: origin.toUpperCase(),
        departure_date: returnDate
      });
    }

    const response = await axios.post(
      'https://api.duffel.com/air/offer_requests',
      {
        data: {
          slices,
          passengers: Array.from({ length: Number(adults) }, () => ({
            type: 'adult'
          })),
          cabin_class: 'economy'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      offerRequestId: response.data?.data?.id,
      offers: response.data?.data?.offers || [],
      data: response.data?.data
    });

  } catch (error) {
    console.error('ERRO DUFFEL:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar voos',
      details: error.response?.data || error.message
    });
  }
});

export default router;
