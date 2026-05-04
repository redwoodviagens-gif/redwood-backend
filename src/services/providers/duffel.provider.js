import axios from "axios";
import { env } from "../../config/env.js";

export async function searchDuffelFlights(params) {
  if (!env.duffel.token) {
    throw new Error("Token Duffel não configurado.");
  }

  const { origin, destination, departureDate, returnDate, adults = 1 } = params;

  const slices = [
    {
      origin,
      destination,
      departure_date: departureDate,
    },
  ];

  if (returnDate) {
    slices.push({
      origin: destination,
      destination: origin,
      departure_date: returnDate,
    });
  }

  const passengers = Array.from({ length: Number(adults) }, () => ({
    type: "adult",
  }));

  // 🔥 PASSO 1: CRIAR REQUEST
  const { data: requestData } = await axios.post(
    `${env.duffel.baseUrl}/air/offer_requests`,
    {
      slices,
      passengers,
      cabin_class: "economy",
    },
    {
      headers: {
        Authorization: `Bearer ${env.duffel.token}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
      },
    }
  );

  const requestId = requestData?.data?.id;

  if (!requestId) {
    throw new Error("Falha ao criar request de ofertas");
  }

  // 🔥 PASSO 2: BUSCAR OFERTAS
  const { data: offersResponse } = await axios.get(
    `${env.duffel.baseUrl}/air/offers?offer_request_id=${requestId}`,
    {
      headers: {
        Authorization: `Bearer ${env.duffel.token}`,
        "Duffel-Version": "v2",
      },
    }
  );

  const offers = offersResponse?.data || [];

  return offers.slice(0, 10).map((offer) => ({
    provider: "duffel",
    id: offer.id,
    price: Number(offer.total_amount || 0),
    currency: offer.total_currency,
    validatingAirlinesCodes: [offer.owner?.iata_code],
    itineraries: offer.slices || [],
    raw: offer,
  }));
}
