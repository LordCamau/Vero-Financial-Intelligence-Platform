import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import accountsRoutes from './routes/accountsRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import insightsRoutes from './routes/insightsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/accounts', accountsRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/insights', insightsRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
