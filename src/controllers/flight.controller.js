import { searchFlights } from "../services/flightProvider.service.js";
import { predictPrice } from "../services/pricePrediction.service.js";
import { buildWhatsAppLink } from "../utils/whatsapp.js";

export async function searchFlightsController(req, res, next) {
  try {
    // 🔥 AGORA FUNCIONA COM POST (body) E GET (query)
    const source = req.method === "POST" ? req.body : req.query;

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      passengers,
      provider,
    } = source;

    const totalAdults = Number(adults || passengers || 1);

    // 🛑 VALIDAÇÃO
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error:
          "Informe origin, destination e departureDate. Ex: origin=GRU&destination=MCZ&departureDate=2026-06-10",
      });
    }

    // 🔎 BUSCA VOOS
    const offers = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: totalAdults,
      provider,
    });

    // 📊 MÉDIA DE PREÇOS
    const prices = offers.map((o) => o.price).filter(Boolean);
    const averagePrice = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : null;

    // 📈 ENRIQUECER DADOS
    const enriched = offers.map((offer) => {
      const prediction = predictPrice({
        price: offer.price,
        departureDate,
        averagePrice,
      });

      return {
        ...offer,
        prediction,
        whatsappLink: buildWhatsAppLink({
          origin,
          destination,
          departureDate,
          returnDate,
          adults: totalAdults,
          price: offer.price,
          probability: prediction.probability,
          trend: prediction.trend,
        }),
      };
    });

    // ✅ RESPOSTA FINAL
    return res.json({
      provider: provider || undefined,
      count: enriched.length,
      averagePrice,
      offers: enriched,
    });

  } catch (err) {
    console.error("Erro na busca de voos:", err);
    next(err);
  }
}
