import { env } from '../config/env.js';

export function buildWhatsAppLink({ origin, destination, departureDate, returnDate, adults, price, probability, trend }) {
  const text = `Olá, vim pelo buscador inteligente da Redwood Viagens.\n\nQuero cotar uma passagem:\nOrigem: ${origin}\nDestino: ${destination}\nIda: ${departureDate}\nVolta: ${returnDate || 'sem volta definida'}\nPassageiros: ${adults}\nPreço encontrado: ${price ? `R$ ${price}` : 'a consultar'}\nTendência: ${trend || 'a analisar'}\nProbabilidade: ${probability ? `${probability}%` : 'a analisar'}\n\nPode me ajudar?`;
  return `https://wa.me/${env.whatsappPhone}?text=${encodeURIComponent(text)}`;
}
