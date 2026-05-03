function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(dateString + 'T00:00:00');
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function predictPrice({ price, departureDate, averagePrice }) {
  const days = daysUntil(departureDate);
  let probabilityDown = 50;

  if (days > 90) probabilityDown += 22;
  else if (days > 60) probabilityDown += 15;
  else if (days > 30) probabilityDown += 6;
  else if (days < 15) probabilityDown -= 25;
  else if (days < 30) probabilityDown -= 12;

  if (averagePrice && price) {
    const diff = (price - averagePrice) / averagePrice;
    if (diff > 0.18) probabilityDown += 18;
    else if (diff > 0.08) probabilityDown += 10;
    else if (diff < -0.15) probabilityDown -= 18;
    else if (diff < -0.08) probabilityDown -= 10;
  }

  probabilityDown = Math.max(12, Math.min(91, Math.round(probabilityDown)));
  return {
    probability: probabilityDown,
    trend: probabilityDown >= 60 ? 'descer' : 'subir',
    recommendation: probabilityDown >= 60 ? 'Espere, o preço pode descer' : 'Compre agora, o preço pode subir'
  };
}
