import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { fetchAnomalies, fetchCashflow, fetchHealthScore, fetchSubscriptions } from '../services/insightsService';

export async function getSubscriptions(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await fetchSubscriptions(user.id);
  return res.json(data);
}

export async function getAnomalies(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await fetchAnomalies(user.id);
  return res.json(data);
}

export async function getCashflow(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await fetchCashflow(user.id);
  return res.json(data);
}

export async function getHealth(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await fetchHealthScore(user.id);
  return res.json(data);
}
