import { getSession } from '@/lib/getSession';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function HomePage() {
  const session = await getSession();
  console.log('SESSION: ', session);
  const user = session?.user;
  if (!user) redirect('/login');

  return <div>HomePage</div>;
}
