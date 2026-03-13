import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getDashboardMetrics } from '../services/dashboardService';

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await getDashboardMetrics(user.id);
  return res.json(data);
}
