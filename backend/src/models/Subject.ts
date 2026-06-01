import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    minAttendanceTarget: number;
    color: 'cyan' | 'purple' | 'blue' | 'red' | 'yellow' | 'gray';
    timetableSlides: { day: string; time: string }[];
    totalClasses?: number;
    attendedClasses?: number;
}

const SubjectSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, unique: true },
    minAttendanceTarget: { type: Number, default: 75 },
    color: {
        type: String,
        enum: ['cyan', 'purple', 'blue', 'red', 'yellow', 'gray'],
        default: 'cyan'
    },
    timetableSlides: [{
        day: { type: String, required: true },
        time: { type: String, required: true }
    }],
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 }
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);
