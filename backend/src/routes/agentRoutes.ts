import express from 'express';
import { chatWithAgent } from '../controllers/agentController';
import { protect, optionalProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/chat', optionalProtect, chatWithAgent);

export default router;
