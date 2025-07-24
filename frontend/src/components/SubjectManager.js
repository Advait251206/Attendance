// frontend/src/components/SubjectManager.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, PlusIcon } from '@heroicons/react/24/solid';
import { secureApiClient } from '../api/axios';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await secureApiClient.get('/api/subjects/');
        setSubjects(response.data);
      } catch (err) {
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName) {
        setError('Subject name is required.');
        return;
    }
    try {
      const response = await secureApiClient.post('/api/subjects/', {
        name: newSubjectName,
        professor: newProfessor,
      });
      setSubjects([...subjects, response.data]);
      setNewSubjectName('');
      setNewProfessor('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add subject.');
    }
  };

  if (loading) {
    return <p className="animate-pulse">// Loading subjects...</p>;
  }

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl mb-4 flex items-center">
        <BookOpenIcon className="h-6 w-6 mr-2" />
        {'// My Subjects'}
      </h2>

      <form onSubmit={handleAddSubject} className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="New Subject Name"
          className="input-field flex-grow"
        />
        <input
          type="text"
          value={newProfessor}
          onChange={(e) => setNewProfessor(e.target.value)}
          placeholder="Professor (Optional)"
          className="input-field flex-grow"
        />
        <button type="submit" className="btn-primary flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-1" />
          Add
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{`Error: ${error}`}</p>}

      <div className="space-y-3">
        <AnimatePresence>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <motion.div
                key={subject.id}
                className="bg-matrix-bg p-3 rounded-md border border-cyber-blue/30 flex justify-between items-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
              >
                <p className="font-bold text-cyber-blue">{subject.name}</p>
                <p className="text-sm text-terminal-gray">{subject.professor}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-terminal-gray">// No subjects added yet. Add one above.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubjectManager;