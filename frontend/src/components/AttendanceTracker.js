// frontend/src/components/AttendanceTracker.js

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDaysIcon, CheckCircleIcon, XCircleIcon, NoSymbolIcon, SunIcon } from '@heroicons/react/24/solid';
import { secureApiClient } from '../api/axios';
import { weeklySchedule } from '../data/timetableData';

const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
};

const AttendanceTracker = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [subjects, setSubjects] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [scheduleForToday, setScheduleForToday] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // The syntax error here has been fixed (removed the extra '.')
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const formattedDate = formatDateForAPI(currentDate);

        try {
            const [subjectsResponse, attendanceResponse] = await Promise.all([
                secureApiClient.get('/api/subjects/'),
                secureApiClient.get(`/api/attendance/${formattedDate}`)
            ]);
            setSubjects(subjectsResponse.data);
            setAttendanceRecords(attendanceResponse.data);
            const dayOfWeek = currentDate.getDay();
            setScheduleForToday(weeklySchedule[dayOfWeek] || []);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAttendance = async (subjectName, status) => {
        const subject = subjects.find(s => s.name === subjectName);
        if (!subject) {
            setError(`Subject "${subjectName}" not found. Add it via the Subjects tab first.`);
            return;
        }
        const existingRecord = attendanceRecords.find(r => r.subject.id === subject.id);
        const formattedDate = formatDateForAPI(currentDate);
        try {
            if (existingRecord) {
                await secureApiClient.put(`/api/attendance/${existingRecord.id}`, { status, subject_id: subject.id, date: formattedDate });
            } else {
                await secureApiClient.post('/api/attendance/', { date: formattedDate, status, subject_id: subject.id });
            }
            fetchData();
        } catch (err) {
            setError('Failed to update attendance.');
        }
    };
    
    const getStatusBadge = (subjectName) => {
        const record = attendanceRecords.find(r => r.subject.name === subjectName);
        if (!record) return null;
        const statusMap = {
            present: { text: 'Present', icon: CheckCircleIcon, color: 'text-hacker-green' },
            absent: { text: 'Absent', icon: XCircleIcon, color: 'text-red-500' },
            cancelled: { text: 'Cancelled', icon: NoSymbolIcon, color: 'text-yellow-500' }
        };
        const { text, icon: Icon, color } = statusMap[record.status] || {};
        if (!text) return null;
        return (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`flex items-center text-sm font-bold ${color}`}>
                <Icon className="h-5 w-5 mr-1"/>
                {text}
            </motion.div>
        );
    };

    return (
        <div className="card">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl mb-4 md:mb-0 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2" />
                    {'Daily Log'}
                </h2>
                <input
                    type="date"
                    value={formatDateForAPI(currentDate)}
                    onChange={(e) => setCurrentDate(new Date(e.target.value))}
                    className="input-field w-full md:w-auto bg-matrix-bg"
                />
            </div>
            {error && <p className="text-red-500 mb-4">{`Error: ${error}`}</p>}
            {loading ? (
                <p className="animate-pulse text-center p-8">{'Loading schedule...'}</p>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {scheduleForToday.length > 0 ? (
                            scheduleForToday.map((classInfo, index) => (
                                <motion.div
                                    key={index}
                                    className={`p-4 rounded-lg border ${classInfo.type === 'break' ? 'border-dashed border-terminal-gray/30 bg-matrix-bg/50' : 'border-hacker-green/30 bg-matrix-bg hover:border-hacker-green/80'} transition-all`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div className="mb-4 md:mb-0">
                                            <p className={`font-bold text-lg ${classInfo.type === 'break' ? 'text-yellow-400' : 'text-hacker-green'}`}>
                                                {classInfo.type === 'break' && <SunIcon className="h-5 w-5 inline-block mr-2" />}
                                                {classInfo.name}
                                            </p>
                                            <p className="text-sm text-terminal-gray">{classInfo.time}</p>
                                        </div>
                                        {classInfo.type !== 'break' && (
                                            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                                                <div className="mb-2 h-6">
                                                    {getStatusBadge(classInfo.name)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleMarkAttendance(classInfo.name, 'present')} className="btn-primary text-xs px-2 py-1">Present</button>
                                                    <button onClick={() => handleMarkAttendance(classInfo.name, 'absent')} className="bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-md hover:bg-red-600 transition-all">Absent</button>
                                                    <button onClick={() => handleMarkAttendance(classInfo.name, 'cancelled')} className="bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-md hover:bg-yellow-600 transition-all">Cancelled</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-center p-8 text-terminal-gray">{'No classes scheduled for this day.'}</p>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AttendanceTracker;