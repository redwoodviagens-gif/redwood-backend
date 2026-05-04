import axios from 'axios';
import { env } from '../../config/env.js';

export async function searchDuffelFlights(params) {
  if (!env.duffel.token) throw new Error('Token Duffel não configurado.');
  const { origin, destination, departureDate, returnDate, adults = 1 } = params;

  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });

  const passengers = Array.from({ length: Number(adults) }, () => ({ type: 'adult' }));

  const { data } = await axios.post(`${env.duffel.baseUrl}/air/offer_requests`, {
    data: { slices, passengers, cabin_class: 'economy' }
  }, {
    headers: {
      Authorization: `Bearer ${env.duffel.token}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json'
    }
  });

 const offers = data?.data?.offers || [];
  return offers.slice(0, 10).map((offer) => ({
    provider: 'duffel',
    id: offer.id,
    price: Number(offer.total_amount || 0),
    currency: offer.total_currency,
    validatingAirlineCodes: offer.owner ? [offer.owner.iata_code] : [],
    itineraries: offer.slices || [],
    raw: offer
  }));
}
