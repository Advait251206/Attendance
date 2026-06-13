import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    date: Date;
    userId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    status: 'Present' | 'Absent' | 'Cancelled' | 'Extra';
    note?: string;
}

const AttendanceSchema: Schema = new Schema({
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Cancelled', 'Extra'],
        required: true
    },
    note: { type: String } // Optional daily note
});

// Compound index to prevent duplicate records for same subject on same day (if desired, or handle in logic)
// AttendanceSchema.index({ date: 1, subjectId: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
