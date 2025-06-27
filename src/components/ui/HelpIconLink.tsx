import Link from 'next/link';
import React from 'react';

interface HelpIconLinkProps {
  href: string;
  label?: string;
  className?: string;
}

const HelpIconLink: React.FC<HelpIconLinkProps> = ({ href, label = 'Help', className = '' }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`inline-flex items-center justify-center rounded-full p-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 ${className}`}
    title={label}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4 text-sky-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9a3.375 3.375 0 016.24-1.687c.356.527.51 1.16.385 1.78-.174.89-.977 1.507-1.75 1.932-.772.425-1.575 1.042-1.75 1.933M12 17h.008v.008H12V17z"
      />
    </svg>
  </Link>
);

export default HelpIconLink;
