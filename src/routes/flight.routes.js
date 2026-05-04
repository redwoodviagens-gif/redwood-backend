import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      passengers,
      provider
    } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        received: req.body
      });
    }

    // TESTE INICIAL (sem Duffel ainda)
    return res.json({
      success: true,
      message: 'API funcionando corretamente',
      flights: [],
      search: {
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        passengers,
        provider
      }
    });

  } catch (error) {
    console.error('ERRO NA ROTA:', error);

    return res.status(500).json({
      error: 'Erro interno',
      message: error.message
    });
  }
});

export default router;
