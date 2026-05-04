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

    const offers = response.data?.data?.offers || [];

    const flights = offers.map((offer) => {
      const firstSlice = offer.slices?.[0];
      const firstSegment = firstSlice?.segments?.[0];
      const lastSegment =
        firstSlice?.segments?.[firstSlice.segments.length - 1];

      return {
        id: offer.id,
        price: Number(offer.total_amount),
        currency: offer.total_currency,
        priceText: `${offer.total_amount} ${offer.total_currency}`,
        airline: offer.owner?.name || 'Companhia não informada',
        airlineLogo: offer.owner?.logo_symbol_url || null,
        origin: firstSlice?.origin?.iata_code || origin.toUpperCase(),
        destination: firstSlice?.destination?.iata_code || destination.toUpperCase(),
        departureTime: firstSegment?.departing_at || null,
        arrivalTime: lastSegment?.arriving_at || null,
        duration: firstSlice?.duration || null,
        stops: Math.max((firstSlice?.segments?.length || 1) - 1, 0),
        raw: offer
      };
    });

    flights.sort((a, b) => a.price - b.price);

    return res.json({
      success: true,
      total: flights.length,
      offerRequestId: response.data?.data?.id,
      flights
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
