'use server';

import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { hash } from 'bcryptjs';
import { CredentialsSignin } from 'next-auth';
import { signIn } from '@/auth';

const login = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('All fields are required');
  }

  try {
    await signIn('credentials', {
      redirect: false,
      callbackUrl: '/',
      email,
      password,
    });
    console.log('AFTER');
  } catch (error) {
    console.log('ERROR');
    const someError = error as CredentialsSignin;
    console.log('some error: ' + someError);
    return someError.cause;
  }
  redirect('/');
};

const register = async (formData: FormData) => {
  const firstName = formData.get('firstname') as string;
  const lastName = formData.get('lastname') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!firstName || !lastName || !email || !password) {
    throw new Error('All fields are required');
  }

  // Check if existing user
  const existingUser = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await hash(password, 12);

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    },
  });
  console.log('User successfully login');
  redirect('/login');
};

export { register, login };
