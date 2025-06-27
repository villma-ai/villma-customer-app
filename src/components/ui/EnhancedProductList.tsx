'use client';
import { UserProduct } from '@/lib/firestore';
import HelpIconLink from './HelpIconLink';

interface EnhancedProductListProps {
  products: UserProduct[];
  onProductClick: (product: UserProduct) => void;
}

export default function EnhancedProductList({
  products,
  onProductClick
}: EnhancedProductListProps) {
  return (
    <div className="mt-4">
      <div className="font-semibold mb-2 text-sm text-gray-700">
        Enhanced Products <HelpIconLink href="./help#enhanced-products" label="help" />
      </div>
      <ul className="space-y-2">
        {products.map((product) => (
          <li
            key={product.id}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-sky-50"
            onClick={() => onProductClick(product)}
          >
            <div className="flex items-center justify-between">
              <span>{product.title}</span>
              <span className="text-xs text-gray-400">Edit</span>
            </div>
          </li>
        ))}
        {products.length === 0 && <li className="text-gray-400">No products added yet.</li>}
      </ul>
    </div>
  );
}
