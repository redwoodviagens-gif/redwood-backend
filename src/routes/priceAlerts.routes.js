import express from "express";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

global.fetch = fetch;

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", async (req, res) => {
  try {
    const {
      nome,
      whatsapp,
      email,
      origem,
      destino,
      dataIda,
      dataVolta,
      passageiros = 1,
      precoAtual,
      moeda = "BRL",
      precoDesejado,
      companhia,
      codigoCompanhia,
      horarioIda,
      horarioVolta,
      offerId,
      provider = "duffel",
      observacoes,
      campanha,
      raw,
    } = req.body;

    if (!origem || !destino || !dataIda || !precoAtual) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios ausentes",
        required: ["origem", "destino", "dataIda", "precoAtual"],
        received: req.body,
      });
    }

    const { data, error } = await supabase
      .from("price_alerts")
      .insert([
        {
          nome: nome || null,
          whatsapp: whatsapp || "lead-site",
          email: email || null,
          origem,
          destino,
          data_ida: dataIda,
          data_volta: dataVolta || null,
          passageiros,
          preco_atual: precoAtual,
          moeda,
          preco_desejado: precoDesejado || null,
          companhia: companhia || null,
          codigo_companhia: codigoCompanhia || null,
          horario_ida: horarioIda || null,
          horario_volta: horarioVolta || null,
          offer_id: offerId || null,
          provider,
          status: "novo",
          observacoes: observacoes || null,
          campanha: campanha || "site-redwood",
          raw: raw || null,
        },
      ])
      .select();

    if (error) {
      console.error("ERRO SUPABASE:", error);
      throw error;
    }

    return res.json({
      success: true,
      message: "Alerta de preço salvo com sucesso",
      alert: data?.[0] || null,
    });
  } catch (err) {
    console.error("ERRO AO SALVAR ALERTA:", err);

    return res.status(500).json({
      success: false,
      error: "Erro ao salvar alerta",
      details: err.message,
    });
  }
});

export default router;
