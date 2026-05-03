import express from 'express';
import priceAlertsRoutes from "./routes/priceAlerts.routes.js";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import flightRoutes from './routes/flight.routes.js';
import leadRoutes from './routes/lead.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use("/api/price-alerts", priceAlertsRoutes);
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'Redwood Multi-API Backend', defaultProvider: env.defaultProvider }));
app.use('/api/flights', flightRoutes);
app.use('/api/leads', leadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Erro interno' });
});

app.listen(env.port, () => console.log(`Redwood backend rodando na porta ${env.port}`));
