'use client';
import { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import HelpIconLink from './HelpIconLink';

interface ProductSearchInputProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  dropdownOpen: boolean;
  setDropdownOpen: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  shopifyError: string | null;
  products: { id: string; title: string }[];
  handleAddProduct: (product: { id: string; title: string }) => Promise<void>;
  saving: boolean;
}

export default function ProductSearchInput({
  search,
  setSearch,
  dropdownOpen,
  setDropdownOpen,
  loading,
  error,
  shopifyError,
  products,
  handleAddProduct,
  saving
}: ProductSearchInputProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, setDropdownOpen]);

  return (
    <div className="relative">
      <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-2">
        Search Products <HelpIconLink href="./help#enhanced-products" label="help" />
      </label>
      <input
        id="product-search"
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setDropdownOpen(true);
        }}
        placeholder="Type to search products..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm mb-4 text-gray-900"
        autoComplete="off"
      />
      {dropdownOpen && search && (
        <div
          ref={dropdownRef}
          className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          {loading && <div className="p-3 text-gray-500">Searching...</div>}
          {(error || shopifyError) && (
            <div className="p-3 text-red-600">{error || shopifyError}</div>
          )}
          <ul className="divide-y divide-gray-100">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <span>{product.title}</span>
                <button
                  className="ml-2 p-1 rounded-full hover:bg-sky-100 text-sky-600 cursor-pointer"
                  onClick={() => handleAddProduct(product)}
                  disabled={saving}
                  aria-label="Add product"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </li>
            ))}
            {!loading && products.length === 0 && search && (
              <li className="p-3 text-gray-400">No products found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
