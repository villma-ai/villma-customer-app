'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';

interface TooltipHelpProps {
  label: string;
  href: string;
  children: ReactNode;
}

export default function TooltipHelp({ label, href, children }: TooltipHelpProps) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
          {label}
          <Link href={href} className="underline text-sky-300 ml-1" target="_blank">
            Help
          </Link>
        </span>
      )}
    </span>
  );
}
