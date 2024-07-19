import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userRole = await prisma.role.findUnique({ where: { name: role } });

    if (!userRole) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: {
          connect: { id: userRole.id },
        },
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
