import { env } from '../config/env.js';
import { searchAmadeusFlights } from './providers/amadeus.provider.js';
import { searchDuffelFlights } from './providers/duffel.provider.js';
import { searchKiwiFlights } from './providers/kiwi.provider.js';

const providers = {
  amadeus: searchAmadeusFlights,
  duffel: searchDuffelFlights,
  kiwi: searchKiwiFlights
};

export async function searchFlights(params) {
  const provider = params.provider || env.defaultProvider;
  const handler = providers[provider];
  if (!handler) throw new Error(`Provider inválido: ${provider}. Use: amadeus, duffel ou kiwi.`);
  return handler(params);
}
