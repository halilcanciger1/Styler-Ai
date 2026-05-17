import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cok-gizli-super-guvenli-bir-sir';

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
