import { Router } from 'express';
import { createAccount, getAccount, listAccounts } from '../controllers/accountsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, createAccount);
router.get('/', requireAuth, listAccounts);
router.get('/:id', requireAuth, getAccount);

export default router;
