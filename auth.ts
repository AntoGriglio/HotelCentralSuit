// auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { usuario } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const {
  auth, // para usar en middleware más adelante si querés
  handlers: { GET, POST }, // para usar en las rutas API
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
async authorize(credentials) {
  const email = (credentials?.email as string)?.trim();
  const password = (credentials?.password as string)?.trim();


  if (!email || !password) throw new Error('Credenciales inválidas');

  const users = await db.select().from(usuario).where(eq(usuario.email, email)).limit(1);
  const user = users[0];


  if (!user) throw new Error('Usuario no encontrado');

  const hash = user.contrasenia?.trim();

  const valid = await bcrypt.compare(password, hash);

  if (!valid) throw new Error('Contraseña incorrecta');

  return { id: user.id, email: user.email, name: user.nombre };
}

,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
});
