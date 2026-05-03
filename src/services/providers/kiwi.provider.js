import axios from 'axios';
import { env } from '../../config/env.js';

export async function searchKiwiFlights(params) {
  if (!env.kiwi.apiKey) throw new Error('KIWI_API_KEY não configurada.');
  const { origin, destination, departureDate, returnDate, adults = 1 } = params;

  const formatDate = (iso) => iso.split('-').reverse().join('/');
  const { data } = await axios.get(`${env.kiwi.baseUrl}/v2/search`, {
    headers: { apikey: env.kiwi.apiKey },
    params: {
      fly_from: origin,
      fly_to: destination,
      date_from: formatDate(departureDate),
      date_to: formatDate(departureDate),
      return_from: returnDate ? formatDate(returnDate) : undefined,
      return_to: returnDate ? formatDate(returnDate) : undefined,
      adults,
      curr: 'BRL',
      limit: 10
    }
  });

  return (data.data || []).map((offer) => ({
    provider: 'kiwi',
    id: offer.id,
    price: Number(offer.price || 0),
    currency: 'BRL',
    validatingAirlineCodes: offer.airlines || [],
    itineraries: offer.route || [],
    raw: offer
  }));
}
