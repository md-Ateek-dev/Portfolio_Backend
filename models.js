import mongoose from 'mongoose';

// ─── Admin Schema ────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
}, { timestamps: true });

// ─── Skills Schema ────────────────────────────────────────────────────────────
const skillSchema = new mongoose.Schema({
    iconName: { type: String, required: true },
    name: { type: String, required: true },
    percent: { type: Number, required: true },
    color: { type: String, required: true },
}, { timestamps: true });

// ─── Stats Schema ─────────────────────────────────────────────────────────────
const statsSchema = new mongoose.Schema({
    experience: { type: String, default: '1+' },
    projects: { type: String, default: '5+' },
    clients: { type: String, default: 'Pending..' },
}, { timestamps: true });

// ─── Project Schema ───────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema({
    w_imag: { type: String, default: '' },
    title: { type: String, required: true },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    year: { type: String, default: '' },
    link: { type: String, default: '' },
}, { timestamps: true });

export const Admin = mongoose.model('Admin', adminSchema);
export const Skill = mongoose.model('Skill', skillSchema);
export const Stats = mongoose.model('Stats', statsSchema);
export const Project = mongoose.model('Project', projectSchema);
