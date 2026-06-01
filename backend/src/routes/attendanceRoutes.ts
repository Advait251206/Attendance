import express from 'express';
import { markAttendance, getAttendance } from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', markAttendance);
router.get('/', getAttendance);

export default router;
