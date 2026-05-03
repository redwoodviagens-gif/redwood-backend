import { searchFlights } from '../services/flightProvider.service.js';
import { predictPrice } from '../services/pricePrediction.service.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export async function searchFlightsController(req, res, next) {
  try {
    const { origin, destination, departureDate, returnDate, adults = 1, provider } = req.query;
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ error: 'Informe origin, destination e departureDate. Ex: origin=GRU&destination=MCZ&departureDate=2026-06-10' });
    }

    const offers = await searchFlights({ origin, destination, departureDate, returnDate, adults, provider });
    const prices = offers.map(o => o.price).filter(Boolean);
    const averagePrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

    const enriched = offers.map((offer) => {
      const prediction = predictPrice({ price: offer.price, departureDate, averagePrice });
      return {
        ...offer,
        prediction,
        whatsappLink: buildWhatsAppLink({ origin, destination, departureDate, returnDate, adults, price: offer.price, probability: prediction.probability, trend: prediction.trend })
      };
    });

    res.json({ provider: provider || undefined, count: enriched.length, averagePrice, offers: enriched });
  } catch (err) {
    next(err);
  }
}
