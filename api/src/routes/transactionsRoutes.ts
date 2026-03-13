import { Router } from 'express';
import { createTransaction, getTransaction, listTransactions } from '../controllers/transactionsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, createTransaction);
router.get('/', requireAuth, listTransactions);
router.get('/:id', requireAuth, getTransaction);

export default router;
