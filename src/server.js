import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function normalizePrice(value) {
  const price = Number(value || 0);
  return Number.isFinite(price) ? price : 0;
}

function estimateAveragePrice(price) {
  const current = normalizePrice(price);
  if (current <= 0) return 1000;

  return Number((current * 1.45).toFixed(2));
}

function calculateDropProbability(price, averagePrice, departureDate) {
  const currentPrice = normalizePrice(price);
  const avgPrice = normalizePrice(averagePrice || estimateAveragePrice(price));

  if (currentPrice <= 0 || avgPrice <= 0) return 50;

  const priceIndex = currentPrice / avgPrice;

  let probability = 50;

  if (priceIndex <= 0.65) probability = 20;
  else if (priceIndex <= 0.75) probability = 30;
  else if (priceIndex <= 0.95) probability = 45;
  else if (priceIndex <= 1.1) probability = 60;
  else if (priceIndex <= 1.25) probability = 75;
  else probability = 85;

  if (departureDate) {
    const today = new Date();
    const departure = new Date(departureDate);
    const daysToTrip = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));

    if (daysToTrip <= 7) probability -= 20;
    else if (daysToTrip <= 15) probability -= 10;
    else if (daysToTrip >= 90) probability += 10;
  }

  return Math.max(0, Math.min(100, Math.round(probability)));
}

function analyzeFare(currentPrice, averagePrice, dropProbability) {
  const price = normalizePrice(currentPrice);
  const avg = normalizePrice(averagePrice || estimateAveragePrice(price));
  const probability = Math.max(0, Math.min(100, Number(dropProbability || 0)));

  const priceIndex = avg > 0 ? price / avg : 1;

  let fareLevel = "";
  let recommendation = "";
  let message = "";

  if (priceIndex <= 0.75) {
    fareLevel = "TARIFA BAIXA";
  } else if (priceIndex <= 1.05) {
    fareLevel = "TARIFA NORMAL";
  } else if (priceIndex <= 1.25) {
    fareLevel = "TARIFA ALTA";
  } else {
    fareLevel = "TARIFA MUITO ALTA";
  }

  if (priceIndex <= 0.75 && probability <= 40) {
    recommendation = "COMPRE AGORA";
    message =
      "Tarifa abaixo da média e baixa chance de queda. Boa oportunidade para emitir agora.";
  } else if (priceIndex <= 0.75 && probability > 40) {
    recommendation = "MONITORAR";
    message =
      "Tarifa boa, mas ainda existe chance relevante de queda. Vale criar um alerta antes de emitir.";
  } else if (priceIndex <= 1.05 && probability >= 60) {
    recommendation = "ESPERAR";
    message =
      "Preço dentro da média, mas com alta chance de queda. Melhor monitorar antes de comprar.";
  } else if (priceIndex > 1.05 && probability >= 50) {
    recommendation = "ESPERAR";
    message =
      "Tarifa acima da média e com chance de queda. Recomendamos aguardar ou criar alerta.";
  } else if (priceIndex > 1.25) {
    recommendation = "PREÇO ALTO";
    message =
      "Tarifa muito acima da média. Recomendamos monitorar antes de emitir.";
  } else {
    recommendation = "MONITORAR";
    message =
      "Preço aceitável, mas sem sinal forte para compra imediata. Crie um alerta.";
  }

  return {
    priceIndex: Number(priceIndex.toFixed(2)),
    averagePrice: avg,
    dropProbability: probability,
    fareLevel,
    recommendation,
    message,
  };
}

function generateMockFlights({ origin, destination, departureDate }) {
  const baseFlights = [
    {
      id: "mock-1",
      airline: "Azul",
      carrier: "Azul",
      departureTime: "08:30",
      arrivalTime: "10:34",
      stops: 0,
      price: 592.7,
    },
    {
      id: "mock-2",
      airline: "LATAM",
      carrier: "LATAM",
      departureTime: "12:15",
      arrivalTime: "14:30",
      stops: 0,
      price: 735.9,
    },
    {
      id: "mock-3",
      airline: "GOL",
      carrier: "GOL",
      departureTime: "18:40",
      arrivalTime: "21:05",
      stops: 1,
      price: 899.5,
    },
  ];

  return baseFlights.map((flight) => {
    const averagePrice = estimateAveragePrice(flight.price);
    const dropProbability = calculateDropProbability(
      flight.price,
      averagePrice,
      departureDate
    );

    const analysis = analyzeFare(flight.price, averagePrice, dropProbability);

    return {
      ...flight,
      origin,
      destination,
      departureDate,
      averagePrice: analysis.averagePrice,
      dropProbability: analysis.dropProbability,
      priceIndex: analysis.priceIndex,
      fareLevel: analysis.fareLevel,
      recommendation: analysis.recommendation,
      decision: analysis.recommendation,
      message: analysis.message,
      currency: "BRL",
    };
  });
}

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Redwood Viagens API funcionando",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "redwood-backend",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/flights", async (req, res) => {
  try {
    const {
      origin = "POA",
      destination = "GIG",
      departureDate,
      returnDate,
      passengers = 1,
    } = req.body || {};

    const flights = generateMockFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
    });

    return res.json({
      success: true,
      source: "mock-statistical-engine",
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      flights,
    });
  } catch (error) {
    console.error("Erro em /api/flights:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar voos",
      error: error.message,
    });
  }
});

app.post("/api/price-alerts", async (req, res) => {
  try {
    const body = req.body || {};

    const currentPrice = normalizePrice(body.currentPrice || body.price);
    const averagePrice = normalizePrice(
      body.averagePrice || estimateAveragePrice(currentPrice)
    );

    const dropProbability =
      body.dropProbability !== undefined
        ? Number(body.dropProbability)
        : calculateDropProbability(
            currentPrice,
            averagePrice,
            body.departureDate
          );

    const analysis = analyzeFare(currentPrice, averagePrice, dropProbability);

    const payload = {
      name: body.name || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      target_price: body.targetPrice ? Number(body.targetPrice) : null,

      origin: body.origin || null,
      destination: body.destination || null,
      departure_date: body.departureDate || null,
      return_date: body.returnDate || null,
      passengers: body.passengers ? Number(body.passengers) : 1,

      current_price: currentPrice,
      average_price: analysis.averagePrice,
      drop_probability: analysis.dropProbability,
      price_index: analysis.priceIndex,
      recommendation: analysis.recommendation,
      fare_level: analysis.fareLevel,

      airline: body.airline || null,
      departure_time: body.departureTime || null,
      arrival_time: body.arrivalTime || null,
      stops: body.stops !== undefined ? Number(body.stops) : 0,

      status: "novo",
      created_at: new Date().toISOString(),
    };

    let inserted = null;

    if (supabase) {
      const { data, error } = await supabase
        .from("price_alerts")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Erro Supabase:", error);
        return res.status(500).json({
          success: false,
          message: "Erro ao salvar alerta no Supabase",
          error: error.message,
        });
      }

      inserted = data;
    }

    return res.status(201).json({
      success: true,
      message: "Alerta de preço criado com sucesso",
      alert: inserted || payload,
      analysis,
    });
  } catch (error) {
    console.error("Erro em /api/price-alerts:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar alerta de preço",
      error: error.message,
    });
  }
});

app.get("/api/price-alerts", async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        alerts: [],
        message: "Supabase não configurado neste ambiente",
      });
    }

    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar alertas",
        error: error.message,
      });
    }

    return res.json({
      success: true,
      alerts: data || [],
    });
  } catch (error) {
    console.error("Erro ao listar alertas:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar alertas",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Redwood rodando na porta ${PORT}`);
});
