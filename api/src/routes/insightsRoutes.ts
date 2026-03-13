import { Router } from 'express';
import { getAnomalies, getCashflow, getHealth, getSubscriptions } from '../controllers/insightsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/subscriptions', requireAuth, getSubscriptions);
router.get('/anomalies', requireAuth, getAnomalies);
router.get('/cashflow', requireAuth, getCashflow);
router.get('/health', requireAuth, getHealth);

export default router;
