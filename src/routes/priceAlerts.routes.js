import express from "express";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      fetch
    }
  }
);

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const alerta = {
      nome: body.nome || null,
      whatsapp: body.whatsapp || "lead-site",
      email: body.email || null,

      origem: body.origem,
      destino: body.destino,

      data_ida: body.dataIda,
      data_volta: body.dataVolta || null,

      passageiros: body.passageiros || 1,

      preco_atual: body.precoAtual,
      moeda: body.moeda || "BRL",
      preco_desejado: body.precoDesejado || null,

      companhia: body.companhia || null,
      codigo_companhia: body.codigoCompanhia || null,

      horario_ida: body.horarioIda || null,
      horario_volta: body.horarioVolta || null,

      offer_id: body.offerId || null,
      provider: body.provider || "duffel",

      status: "novo",
      observacoes: body.observacoes || null,
      campanha: body.campanha || "site-redwood",

      raw: body.raw || null
    };

    if (!alerta.origem || !alerta.destino || !alerta.data_ida || !alerta.preco_atual) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios ausentes",
        required: ["origem", "destino", "dataIda", "precoAtual"],
        received: body
      });
    }

    const { data, error } = await supabase
      .from("price_alerts")
      .insert([alerta])
      .select();

    if (error) {
      console.error("ERRO SUPABASE:", error);
      throw error;
    }

    return res.json({
      success: true,
      message: "Alerta de preço salvo com sucesso",
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
