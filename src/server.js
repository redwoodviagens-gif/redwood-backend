import express from 'express';
import priceAlertsRoutes from './routes/priceAlerts.routes.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import flightRoutes from './routes/flight.routes.js';
import leadRoutes from './routes/lead.routes.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rotas
app.use('/api/price-alerts', priceAlertsRoutes);
app.use('/api/leads', leadRoutes);

// 🔥 TESTE DIRETO (GARANTE QUE A API RESPONDE)
app.post('/api/flights', (req, res) => {
  console.log('🔥 ROTA DIRETA /api/flights OK');
  console.log('BODY:', req.body);

  return res.json({
    success: true,
    message: 'ROTA DIRETA FUNCIONANDO',
    body: req.body
  });
});

// 👉 Mantém sua estrutura modular também
app.use('/api/flights', flightRoutes);

// Health check
app.get('/health', (req, res) =>
  res.json({
    ok: true,
    service: 'Redwood Multi-API Backend',
    defaultProvider: env.defaultProvider
  })
);

// Tratamento de erro
app.use((err, req, res, next) => {
  console.error('ERRO GLOBAL:', err);
  res.status(500).json({
    error: err.message || 'Erro interno'
  });
});

// Start servidor
app.listen(env.port, () =>
  console.log(`🚀 Redwood backend rodando na porta ${env.port}`)
);
