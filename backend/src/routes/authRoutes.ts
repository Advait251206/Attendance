import express from 'express';
import { signup, login, updateProfile, deleteAccount, resetData } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);
router.delete('/data', protect, resetData); // Reset Data Endpoint

export default router;
