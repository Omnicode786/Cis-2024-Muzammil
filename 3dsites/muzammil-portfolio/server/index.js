import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// --- Database Helpers ---

// Initialize DB if not exists
const initDB = async () => {
    try {
        await fs.access(DB_PATH);
    } catch {
        const initialData = {
            users: [],
            userData: {} // Map userId -> { analytics, reports, customers, settings }
        };
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
        console.log('Created new database.json');

        // Seed Admin on Creation
        await seedAdmin();
    }
};

const readDB = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [], userData: {} };
    }
};

const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const seedAdmin = async () => {
    const db = await readDB();
    const adminEmail = 'progamers5656@gmail.com';

    if (!db.users.find(u => u.email === adminEmail)) {
        const adminId = 'user_' + Date.now();
        const adminUser = {
            id: adminId,
            email: adminEmail,
            password: 'power king 123', // User requested plain text
            name: 'Admin User',
            role: 'Super Admin',
            bio: 'The Master Administrator.'
        };

        db.users.push(adminUser);
        db.userData[adminId] = generateInitialData(adminUser.name, true);

        await writeDB(db);
        console.log('Admin Account Seeded.');
    }
};

// --- Data Generators ---

const generateInitialData = (userName, isAdmin = false) => {
    if (isAdmin) {
        return {
            analytics: {
                revenue: {
                    total: Math.floor(Math.random() * 500000) + 100000,
                    growth: (Math.random() * 20).toFixed(1),
                    history: Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 10)
                },
                users: {
                    active: Math.floor(Math.random() * 5000) + 500,
                    growth: (Math.random() * 15).toFixed(1),
                    distribution: { mobile: Math.floor(Math.random() * 40) + 30, desktop: Math.floor(Math.random() * 40) + 30 }
                },
                regions: [
                    { name: 'North America', value: Math.floor(Math.random() * 40) + 20 },
                    { name: 'Europe', value: Math.floor(Math.random() * 30) + 10 },
                    { name: 'Asia', value: Math.floor(Math.random() * 30) + 10 }
                ]
            },
            reports: [
                { id: 'r1', name: 'Q1 Financial Overview.pdf', date: '2025-10-12', type: 'FINANCE', status: 'READY' },
                { id: 'r2', name: 'User Growth Strategy.docx', date: '2025-11-05', type: 'STRATEGY', status: 'DRAFT' }
            ],
            customers: [
                { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', ltv: 54000 },
                { id: 'c2', name: 'Stark Ind', email: 'tony@stark.com', ltv: 125000 }
            ],
            settings: { theme: 'dark', notifications: true }
        };
    } else {
        // Standard User - Clean Slate
        return {
            analytics: {
                revenue: { total: 0, growth: 0, history: [0, 0, 0, 0, 0, 0, 0] },
                users: { active: 0, growth: 0, distribution: { mobile: 0, desktop: 0 } },
                regions: [
                    { name: 'North America', value: 0 },
                    { name: 'Europe', value: 0 },
                    { name: 'Asia', value: 0 }
                ]
            },
            reports: [],
            customers: [],
            settings: { theme: 'dark', notifications: true }
        };
    }
};

// --- Auth Endpoints ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        const userData = db.userData[user.id];
        res.json({ user, data: userData });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { email, password, name } = req.body;
    const db = await readDB();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const userId = 'user_' + Date.now();
    const newUser = {
        id: userId,
        email,
        password,
        name,
        role: 'Analyst',
        bio: 'New Team Member'
    };

    db.users.push(newUser);
    // Standard users get clean slate
    db.userData[userId] = generateInitialData(name, false);

    await writeDB(db);
    res.json({ user: newUser, data: db.userData[userId] });
});

app.put('/api/user', async (req, res) => {
    const { userId, name, bio, role } = req.body;
    const db = await readDB();

    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    db.users[userIndex] = { ...db.users[userIndex], name, bio, role };
    await writeDB(db);

    res.json(db.users[userIndex]);
});

// --- Feature Endpoints ---

app.post('/api/reports/create', async (req, res) => {
    const { userId, type } = req.body; // type e.g., 'FINANCE'
    const db = await readDB();

    if (!db.userData[userId]) return res.status(404).json({ error: 'User data not found' });

    const newReport = {
        id: 'r' + Date.now(),
        name: `${type} Report ${new Date().getFullYear()}.pdf`,
        date: new Date().toISOString().split('T')[0],
        type: type,
        status: 'READY'
    };

    db.userData[userId].reports.unshift(newReport); // Add to top
    await writeDB(db);

    // Simulate processing time
    setTimeout(() => res.json(newReport), 1000);
});

app.post('/api/customers/add', async (req, res) => {
    const { userId, name, email, ltv } = req.body;
    const db = await readDB();

    if (!db.userData[userId]) return res.status(404).json({ error: 'User data not found' });

    const newCustomer = {
        id: 'c' + Date.now(),
        name,
        email,
        ltv: Number(ltv) || 0
    };

    db.userData[userId].customers.unshift(newCustomer);

    // Update Revenue based on LTV
    const currentTotal = db.userData[userId].analytics.revenue.total;
    const newTotal = currentTotal + (Number(ltv) || 0);
    db.userData[userId].analytics.revenue.total = newTotal;

    // Update history (shift and add)
    const history = db.userData[userId].analytics.revenue.history;
    history.shift();
    history.push(Math.floor(newTotal / 1000)); // Simple mock history update

    await writeDB(db);
    res.json(newCustomer);
});

// --- AI Endpoints ---

app.post('/api/ai/generate', async (req, res) => {
    const { apiKey, prompt } = req.body;

    if (!apiKey) return res.status(400).json({ error: 'API Key required' });

    try {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a senior business analyst." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        res.json({ result: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'AI Generation Failed' });
    }
});

// --- Initialization ---

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`VANTAGE Server persistent on http://localhost:${PORT}`);
    });
});
