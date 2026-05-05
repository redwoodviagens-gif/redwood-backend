import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      price,
      priceBRL,
      recommendation,
      phone,
      source = "site-redwood"
    } = req.body;

    if (!origin || !destination || !departureDate || !price) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios ausentes",
        required: ["origin", "destination", "departureDate", "price"]
      });
    }

    const { data, error } = await supabase
      .from("price_alerts")
      .insert([
        {
          origin,
          destination,
          departure_date: departureDate,
          return_date: returnDate || null,
          price,
          price_brl: priceBRL || null,
          recommendation: recommendation || null,
          phone: phone || null,
          source
        }
      ])
      .select();

    if (error) {
      console.error("ERRO SUPABASE:", error);
      throw error;
    }

    return res.json({
      success: true,
      message: "Alerta salvo com sucesso",
      alert: data?.[0] || null
    });
  } catch (err) {
    console.error("ERRO AO SALVAR ALERTA:", err);

    return res.status(500).json({
      success: false,
      error: "Erro ao salvar alerta",
      details: err.message
    });
  }
});

export default router;
