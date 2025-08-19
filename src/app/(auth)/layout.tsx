import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-100 to-sky-400 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-sky-300 rounded-full opacity-30 blur-2xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full opacity-20 blur-3xl -z-10" />

      <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-10 max-w-xl w-full mx-4">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/Villma-Logo.jpg"
            alt="Villma.ai"
            width={80}
            height={80}
            className="rounded-full shadow-lg"
          />
        </div>
        {children}
        <div className="flex justify-end mt-4">
          <Link href="/public-help" target="_blanc">
            <span className="text-xs text-sky-700 underline cursor-pointer">Help & FAQ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
