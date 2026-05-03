import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultProvider: process.env.DEFAULT_FLIGHT_PROVIDER || 'amadeus',
  whatsappPhone: process.env.WHATSAPP_PHONE || '5555992290849',
  amadeus: {
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
  },
  duffel: {
    token: process.env.DUFFEL_ACCESS_TOKEN,
    baseUrl: process.env.DUFFEL_BASE_URL || 'https://api.duffel.com'
  },
  kiwi: {
    apiKey: process.env.KIWI_API_KEY,
    baseUrl: process.env.KIWI_BASE_URL || 'https://api.tequila.kiwi.com'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};
