import bcrypt from 'bcryptjs';
import prisma from '../../src/config/prisma';

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@123';
  const name = process.env.ADMIN_NAME ?? 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed:admin] Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log('[seed:admin] Admin user created:', admin);
}
