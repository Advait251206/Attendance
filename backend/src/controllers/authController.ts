import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Subject from '../models/Subject';
import Attendance from '../models/Attendance';
import Note from '../models/Note';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({ 
            token, 
            user: { id: newUser._id, name: newUser.name, username: newUser.username, email: newUser.email } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body; // identifier = email or username

        if (!identifier || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, username: user.username, email: user.email } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { name, username, email, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check uniqueness if changing username/email
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) {
                res.status(400).json({ error: 'Username already taken' });
                return;
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) {
                res.status(400).json({ error: 'Email already taken' });
                return;
            }
            user.email = email;
        }

        if (name) user.name = name;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        // Delete User
        await User.findByIdAndDelete(userId);

        // Cascading Delete
        await Subject.deleteMany({ userId });
        await Attendance.deleteMany({ userId });
        await Note.deleteMany({ userId });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const resetData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        // Delete all associated data but keep User
        await Subject.deleteMany({ userId });
        await Attendance.deleteMany({ userId });
        await Note.deleteMany({ userId });

        res.json({ message: 'All data has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
