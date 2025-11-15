import AcmeLogo from '@/app/ui/acme-logo';
import { Suspense } from 'react';
import SignupForm from '../ui/signup-form';
import Link from 'next/link';
export default function SignupPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <Suspense>
          <SignupForm />
          <p className="text-center"><Link className='text-sm font-semibold text-gray-900' href="/login">Login</Link> if already have an account</p>
        </Suspense>
      </div>
    </main>
  );
}