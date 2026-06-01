import React, { useState, useEffect } from 'react';

import { Save, Loader2, FileText } from 'lucide-react';
import api from '../../api/axios';
import CyberButton from '../common/CyberButton';
import type { Subject } from '../../types';

interface NoteEditorProps {
    subject: Subject;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ subject }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const fetchNote = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/notes/${subject._id}`);
                setContent(res.data.content || '');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (subject._id) fetchNote();
    }, [subject._id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/notes/${subject._id}`, { content });
            setLastSaved(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-surface/30 border border-white/5 rounded-xl p-4 md:p-6 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: subject.color }}></div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            {subject.name}
                        </h3>
                        <p className="text-xs font-mono text-gray-500">
                            {lastSaved ? `LAST SAVED: ${lastSaved.toLocaleTimeString()}` : 'NOTES DETECTED'}
                        </p>
                    </div>
                </div>

                <CyberButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving || loading}
                    icon={saving ? Loader2 : Save}
                    className={saving ? "opacity-70" : ""}
                >
                    {saving ? 'UPLOADING...' : 'SAVE DATA'}
                </CyberButton>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-primary animate-pulse font-mono">
                    DOWNLOADING DATA PACKETS...
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm md:text-base text-neon-white focus:border-secondary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(188,19,254,0.1)] resize-none font-mono leading-relaxed"
                    placeholder={`Enter detailed notes for ${subject.name}...\n- Syllabus\n- Important Dates\n- Project Deadlines`}
                />
            )}
        </div>
    );
};

export default NoteEditor;
