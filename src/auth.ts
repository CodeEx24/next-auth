import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import db from './lib/db';
import { compare } from 'bcryptjs';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },

      authorize: async (credentials) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (!email || !password) {
          throw new CredentialsSignin('Please provide both email and password');
        }

        const user = await db.user.findFirst({
          where: {
            email: email,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          throw new Error('Password did not matched');
        }

        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          id: user.id,
        };

        return userData;
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Add the token pair values to add to the session
      if (user) {
        token.role = user.role;
        token.name = user.firstName + ' ' + user.lastName;
      }
      // console.log('TOKEN: ', token);
      return token;
    },

    async session({ session, token }) {
      if (token?.sub && token?.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      // console.log('SESSION: ', session);
      return session;
    },

    // signIn: async ({ user, account }) => {
    //   if (account?.provider === 'google') {
    //     try {
    //       const { email, name, image, id } = user;

    //       const alreadyUser = await db.user.findUnique({
    //         where: { email: email as string },
    //       });

    //       if (!alreadyUser) {
    //         await db.user.create({
    //           data: { email, name, image, providerId: id },
    //         });
    //       } else {
    //         return true;
    //       }
    //     } catch (error) {
    //       throw new Error('Error while creating user');
    //     }
    //   }

    //   if (account?.provider === 'credentials') {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
  },
});
