'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { commands } from '@uiw/react-md-editor';
import { UserProduct } from '@/lib/firestore';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface EditProductModalProps {
  product: UserProduct;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
  saving: boolean;
}

export default function EditProductModal({
  product,
  onClose,
  onSave,
  saving
}: EditProductModalProps) {
  const [editorValue, setEditorValue] = useState('');

  useEffect(() => {
    setEditorValue(product.description || '');
  }, [product]);

  const handleSave = async () => {
    await onSave(editorValue);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-4 font-semibold">Agent Confidential Information for {product.title}</div>
        <div data-color-mode="light">
          <MDEditor
            value={editorValue}
            onChange={(v) => setEditorValue(v || '')}
            height={200}
            preview="edit"
            commands={[
              commands.bold,
              commands.hr,
              commands.unorderedListCommand,
              commands.orderedListCommand
            ]}
            extraCommands={[]}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
} 