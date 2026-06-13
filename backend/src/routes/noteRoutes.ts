import express from 'express';
import { getNote, updateNote } from '../controllers/noteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/:subjectId', getNote);
router.put('/:subjectId', updateNote);

export default router;
