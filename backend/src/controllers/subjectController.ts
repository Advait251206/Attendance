import { Request, Response } from 'express';
import Subject from '../models/Subject';
import Attendance from '../models/Attendance';
import Note from '../models/Note';

// @desc    Get all subjects with calculated stats
// @route   GET /api/subjects
export const getSubjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const subjects = await Subject.find({ userId });

        // Aggregation for stats could be done here or in a separate stats endpoint.
        // For simplicity, we'll fetch basic attendance counts for each subject here.
        const subjectsWithStats = await Promise.all(subjects.map(async (subject) => {
            const totalClasses = await Attendance.countDocuments({ subjectId: subject._id, status: { $ne: 'Cancelled' } });
            const attendedClasses = await Attendance.countDocuments({ subjectId: subject._id, status: 'Present' });

            return {
                ...subject.toObject(),
                totalClasses,
                attendedClasses
            };
        }));

        res.json(subjectsWithStats);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new subject
// @route   POST /api/subjects
export const createSubject = async (req: Request, res: Response) => {
    try {
        const { name, minAttendanceTarget, color, timetableSlides } = req.body;

        const userId = (req as any).user.id;

        // Check if exists for THIS user
        const exists = await Subject.findOne({ name, userId });
        if (exists) return res.status(400).json({ message: 'Subject already exists' });

        const subject = await Subject.create({
            userId,
            name,
            minAttendanceTarget,
            color,
            timetableSlides
        });

        // Create empty note for subject
        await Note.create({ userId, subjectId: subject._id, content: '' });

        res.status(201).json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
export const updateSubject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const subject = await Subject.findOneAndUpdate(
            { _id: req.params.id, userId }, 
            req.body, 
            { new: true }
        );
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId });
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        // Cleanup related data
        await Attendance.deleteMany({ subjectId: req.params.id });
        await Note.deleteMany({ subjectId: req.params.id });

        res.json({ message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
