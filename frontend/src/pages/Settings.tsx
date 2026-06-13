import React from 'react';
import { motion } from 'framer-motion';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import GlitchText from '../components/common/GlitchText';
import CyberButton from '../components/common/CyberButton';
import { containerVariants, itemVariants } from '../utils/animations';
import { Trash2, AlertOctagon } from 'lucide-react';

const Settings: React.FC = () => {
    const { subjects, deleteSubject } = useAttendance();
    const { user, updateUserProfile, deleteAccount, resetData } = useAuth();
    
    // ... existing state ...
    
    // Add logic to handle reset
    const handleResetData = async () => {
         if (window.confirm('Are you sure you want to RESET all data?\nThis will delete all subjects, attendance, and notes.\nYour account (username/password) will remain.\nThis cannot be undone.')) {
            try {
                await resetData();
            } catch (error) {
                alert('Failed to reset data');
            }
        }
    };
    
    // Profile State
    const [profileData, setProfileData] = React.useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [msg, setMsg] = React.useState({ type: '', text: '' });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setMsg({ type: '', text: '' });

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
             setMsg({ type: 'error', text: "Passwords don't match" });
             setIsUpdating(false);
             return;
        }

        try {
            await updateUserProfile(profileData);
            setMsg({ type: 'success', text: 'Profile Updated Successfully' });
            // Clear password fields
            setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error: any) {
             setMsg({ type: 'error', text: error.response?.data?.error || 'Update Failed' });
        } finally {
            setIsUpdating(false);
        }
    };



    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
    const [deleteError, setDeleteError] = React.useState('');

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user?.username) {
            setDeleteError('Username does not match');
            return;
        }
        
        try {
            await deleteAccount();
        } catch (error) {
            setDeleteError('Failed to delete account');
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8 pb-20 relative"
        >
            <header className="border-b border-white/5 pb-6">
                <h2 className="text-neon-gray text-sm font-mono mb-2">CONFIGURATION</h2>
                <GlitchText text="SYSTEM SETTINGS" size="lg" />
            </header>

            {/* Profile Settings */}
            <section className="space-y-4">
                <h3 className="text-xl font-display text-white">PROFILE SETTINGS</h3>
                <form onSubmit={handleUpdateProfile} className="bg-surface/20 border border-white/5 rounded-xl p-6 space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Username</label>
                            <input 
                                type="text" 
                                value={profileData.username}
                                onChange={e => setProfileData({...profileData, username: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Email</label>
                            <input 
                                type="email" 
                                value={profileData.email}
                                onChange={e => setProfileData({...profileData, email: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">New Password</label>
                            <input 
                                type="password" 
                                value={profileData.password}
                                onChange={e => setProfileData({...profileData, password: e.target.value})}
                                placeholder="Leave blank to keep current"
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={profileData.confirmPassword}
                                onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})}
                                placeholder="Confirm new password"
                                disabled={!profileData.password}
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary/50 outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>
                    
                    {msg.text && (
                        <div className={`text-xs font-mono p-2 rounded ${msg.type === 'error' ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                            {msg.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <CyberButton type="submit" disabled={isUpdating}>
                            {isUpdating ? 'UPDATING...' : 'UPDATE PROFILE'}
                        </CyberButton>
                    </div>
                </form>
            </section>

            {/* Existing Subjects List */}
            <section className="space-y-4">
                <h3 className="text-xl font-display text-white">DATABASE ENTRIES ({subjects.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map(subject => (
                        <motion.div
                            key={subject._id}
                            variants={itemVariants}
                            className="p-4 rounded-xl border border-white/5 bg-surface/20 flex items-center justify-between group hover:border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-10 rounded-full" style={{ backgroundColor: subject.color }}></div>
                                <div>
                                    <h4 className="font-bold text-white tracking-wide">{subject.name}</h4>
                                    <p className="text-xs font-mono text-gray-500">TARGET: {subject.minAttendanceTarget}%</p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteSubject(subject._id)}
                                className="text-gray-600 hover:text-danger transition-colors p-2"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-8 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-display text-danger flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5" /> DANGER ZONE
                </h3>
                <p className="text-xs font-mono text-gray-500 mt-2 mb-4">ACTIONS HERE ARE IRREVERSIBLE.</p>
                
                <div className="flex flex-col gap-4">
                    <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                        <h4 className="text-white font-bold mb-1">Reset Data</h4>
                        <p className="text-xs text-gray-400 mb-3">Delete all subjects, attendance, and notes. Keep your account.</p>
                        <CyberButton variant="danger" onClick={handleResetData}>
                            RESET ALL DATA
                        </CyberButton>
                    </div>

                    <div className="p-4 border border-danger/20 rounded-lg bg-danger/5">
                        <h4 className="text-danger font-bold mb-1">Delete Account</h4>
                        <p className="text-xs text-gray-400 mb-3">Permanently delete your account and all associated data.</p>
                        <CyberButton variant="danger" onClick={() => setShowDeleteModal(true)}>
                            DELETE ACCOUNT
                        </CyberButton>
                    </div>
                </div>
            </section>

             {/* Delete Confirmation Modal */}
             {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0d1117] border border-white/10 rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
                    >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface/50">
                            <h3 className="text-white font-bold text-sm">Delete Account</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded text-yellow-500 text-xs font-mono">
                                <p>⚠️ Unexpected bad things will happen if you don't read this!</p>
                            </div>

                            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
                                <li>This will permanently delete the <strong>{user?.username}</strong> account.</li>
                                <li>All subjects, attendance records, and notes will be wiped immediately.</li>
                                <li>This action <strong>cannot</strong> be undone.</li>
                            </ul>

                            <div className="space-y-2 pt-2">
                                <label className="text-xs text-gray-400 block">
                                    To confirm, type <span className="text-white font-bold select-all">{user?.username}</span> in the box below
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full bg-[#010409] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-danger/50 outline-none font-mono"
                                />
                            </div>

                             {deleteError && (
                                <p className="text-xs text-danger font-mono">{deleteError}</p>
                            )}

                            <CyberButton 
                                variant="danger" 
                                className="w-full justify-center"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== user?.username}
                            >
                                I understand the consequences, delete this account
                            </CyberButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div >
    );
};

export default Settings;
