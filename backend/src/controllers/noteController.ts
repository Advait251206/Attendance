import { Request, Response } from 'express';
import Note from '../models/Note';

// @desc    Get note for a subject
// @route   GET /api/notes/:subjectId
export const getNote = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const note = await Note.findOne({ subjectId: req.params.subjectId, userId });
        if (!note) {
            // Return empty if not found, or Create one?
            // Let's return empty structure
            return res.json({ subjectId: req.params.subjectId, content: '' });
        }
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update note for a subject
// @route   PUT /api/notes/:subjectId
export const updateNote = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;

        const userId = (req as any).user.id;

        // Upsert
        const note = await Note.findOneAndUpdate(
            { subjectId: req.params.subjectId, userId },
            { content, userId }, // Ensure userId is set on create
            { new: true, upsert: true } // Upsert ensures it creates if missing
        );

        res.json(note);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
