import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import { startOfDay, endOfDay } from 'date-fns';

// @desc    Mark attendance (Single or Batch)
// @route   POST /api/attendance
export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { logs } = req.body; // Expects array of { date, subjectId, status, note }

        if (!Array.isArray(logs)) {
            return res.status(400).json({ message: 'Invalid data format. Expected array of logs.' });
        }

        const createdLogs = [];

        for (const log of logs) {
            // Upsert logic: if record exists for this subject on this date, update it. Else create.
            // We use date-fns to ensure we match the day correctly regardless of time.
            // Assuming the client sends a valid ISO date string.

            const dateObj = new Date(log.date);
            const start = startOfDay(dateObj);
            const end = endOfDay(dateObj);

            // Find existing record for this subject on this day
            let record = await Attendance.findOne({
                userId: (req as any).user.id,
                subjectId: log.subjectId,
                date: { $gte: start, $lte: end }
            });

            if (record) {
                record.status = log.status;
                record.note = log.note;
                await record.save();
                createdLogs.push(record);
            } else {
                const newRecord = await Attendance.create({
                    userId: (req as any).user.id,
                    date: log.date, // Use exact time provided or normalize? Standardizing on client sent time for now.
                    subjectId: log.subjectId,
                    status: log.status,
                    note: log.note
                });
                createdLogs.push(newRecord);
            }
        }

        res.status(201).json(createdLogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance history
// @route   GET /api/attendance
export const getAttendance = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { subjectId, startDate, endDate } = req.query;

        let query: any = { userId };

        if (subjectId) {
            query.subjectId = subjectId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const history = await Attendance.find(query).sort({ date: -1 }).populate('subjectId', 'name color');
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
