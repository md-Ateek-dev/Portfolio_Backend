import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Admin, Skill, Stats, Project } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB Atlas connected successfully!'))
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        // Don't exit - log the error and keep server running
    });
console.log("MONGO_URI:", process.env.MONGO_URI);

// ─── Default seed data ────────────────────────────────────────────────────────
const defaultSkills = [
    { iconName: 'FaHtml5', name: 'HTML5', percent: 100, color: 'from-orange-500 to-red-500' },
    { iconName: 'FaCss3Alt', name: 'CSS3', percent: 100, color: 'from-blue-500 to-cyan-500' },
    { iconName: 'FaJsSquare', name: 'JavaScript', percent: 80, color: 'from-yellow-400 to-orange-400' },
    { iconName: 'FaBootstrap', name: 'Bootstrap', percent: 100, color: 'from-purple-600 to-indigo-600' },
    { iconName: 'FaReact', name: 'React', percent: 70, color: 'from-cyan-400 to-blue-400' },
    { iconName: 'FaNodeJs', name: 'Node.js', percent: 80, color: 'from-green-500 to-emerald-500' },
    { iconName: 'SiExpress', name: 'Express', percent: 80, color: 'from-gray-300 to-gray-500' },
    { iconName: 'SiMongodb', name: 'MongoDB', percent: 90, color: 'from-green-600 to-green-400' },
];

const defaultProjects = [
    {
        w_imag: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        title: 'E-Commerce Platform', category: 'Web Development',
        description: 'Modern e-commerce solution with React & Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'], year: '2024', link: ''
    },
    {
        w_imag: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        title: 'Mobile Banking App', category: 'Mobile App',
        description: 'Secure banking application with biometric authentication',
        technologies: ['React Native', 'Firebase', 'TypeScript'], year: '2024', link: ''
    }
];

// Seed DB on first run if empty
async function seedIfEmpty() {
    const skillCount = await Skill.countDocuments();
    const statsCount = await Stats.countDocuments();
    const projectCount = await Project.countDocuments();

    // Sync admin credentials with environment variables on every start
    const adminUser = process.env.ADMIN_USER || 'Mohd_Ateek09';
    const adminPass = process.env.ADMIN_PASSWORD || 'Ateek@#&258013710415';

    await Admin.findOneAndUpdate(
        {}, // Update the first found admin (or create if none)
        { username: adminUser, password: adminPass },
        { upsert: true, new: true }
    );
    console.log('✅ Admin credentials synced');

    if (skillCount === 0) await Skill.insertMany(defaultSkills);
    if (statsCount === 0) await Stats.create({ experience: '1+', projects: '5+', clients: 'Pending..' });
    if (projectCount === 0) await Project.insertMany(defaultProjects);

    console.log('✅ Seed check complete');
}

mongoose.connection.once('open', seedIfEmpty);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username, password });
        if (admin) {
            res.json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ error: 'Invalid username or password!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error during authentication', details: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SKILLS ROUTES ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET all skills
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: 1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add skill
app.post('/api/skills', async (req, res) => {
    try {
        const skill = await Skill.create(req.body);
        res.status(201).json(skill);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE skill by id
app.delete('/api/skills/:id', async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update all skills (bulk replace)
app.put('/api/skills', async (req, res) => {
    try {
        await Skill.deleteMany({});
        const skills = await Skill.insertMany(req.body);
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATS ROUTES ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Stats.findOne();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update stats
app.put('/api/stats', async (req, res) => {
    try {
        const stats = await Stats.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true }
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PROJECTS ROUTES ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add project
app.post('/api/projects', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE project by id
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Portfolio API running 🚀' }));

app.listen(PORT, () => console.log(`🚀 Server running on:${PORT}`));
