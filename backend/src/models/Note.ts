import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
    userId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    content: string;
    updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, unique: true }, // One note per subject
    content: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<INote>('Note', NoteSchema);
