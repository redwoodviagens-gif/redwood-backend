# Redwood Viagens — Backend Multi-API

Backend em Node.js/Express preparado para usar Amadeus agora e trocar para Duffel ou Kiwi depois sem refazer o sistema.

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Teste:

```text
http://localhost:3000/health
```

## Configurar provider padrão

No `.env`:

```env
DEFAULT_FLIGHT_PROVIDER=amadeus
```

Opções:

```text
amadeus
duffel
kiwi
```

## Buscar voos

```text
http://localhost:3000/api/flights/search?origin=GRU&destination=MCZ&departureDate=2026-06-10&returnDate=2026-06-17&adults=1
```

Forçar provider específico:

```text
http://localhost:3000/api/flights/search?provider=amadeus&origin=GRU&destination=MCZ&departureDate=2026-06-10&returnDate=2026-06-17&adults=1
```

## Salvar lead

POST `/api/leads`

```json
{
  "name": "Cliente Teste",
  "phone": "5599999999999",
  "origin": "GRU",
  "destination": "MCZ",
  "departureDate": "2026-06-10",
  "returnDate": "2026-06-17",
  "adults": 1,
  "price": 2347,
  "probability": 78,
  "trend": "descer",
  "provider": "amadeus",
  "campaign": "facebook-maio",
  "source": "site"
}
```

## Banco Supabase

Execute `supabase/schema.sql` no SQL Editor.

## Deploy Railway

1. Suba esta pasta para o GitHub.
2. Railway > New Project > Deploy from GitHub.
3. Cadastre as variáveis do `.env` em Variables.
4. Deploy.

## Importante

- Amadeus usa códigos IATA: GRU, GIG, BSB, MCZ, POA, MIA, MCO, LIS.
- A previsão atual é regra inicial. Depois pode evoluir para histórico real e machine learning.
- O sistema foi feito com camada de provider para não ficar preso a uma única API.
