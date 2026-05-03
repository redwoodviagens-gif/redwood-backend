import axios from 'axios';
import { env } from '../../config/env.js';

let tokenCache = { accessToken: null, expiresAt: 0 };

async function getToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) return tokenCache.accessToken;
  if (!env.amadeus.clientId || !env.amadeus.clientSecret) throw new Error('Credenciais Amadeus não configuradas.');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.amadeus.clientId,
    client_secret: env.amadeus.clientSecret
  });

  const { data } = await axios.post(`${env.amadeus.baseUrl}/v1/security/oauth2/token`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000
  };
  return tokenCache.accessToken;
}

export async function searchAmadeusFlights(params) {
  const token = await getToken();
  const { origin, destination, departureDate, returnDate, adults = 1, currencyCode = 'BRL' } = params;

  const query = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults,
    currencyCode,
    max: 10
  };
  if (returnDate) query.returnDate = returnDate;

  const { data } = await axios.get(`${env.amadeus.baseUrl}/v2/shopping/flight-offers`, {
    headers: { Authorization: `Bearer ${token}` },
    params: query
  });

  return (data.data || []).map((offer) => ({
    provider: 'amadeus',
    id: offer.id,
    price: Number(offer.price?.grandTotal || 0),
    currency: offer.price?.currency || currencyCode,
    validatingAirlineCodes: offer.validatingAirlineCodes || [],
    itineraries: offer.itineraries || [],
    raw: offer
  }));
}
