import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
} 