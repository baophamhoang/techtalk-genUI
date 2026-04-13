import { useState } from "react";
import { ShoppingCart, Star, Check } from "lucide-react";

export interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  imageUrl: string;
  inStock?: boolean;
  rating?: number;
}

export function ProductCard({ name, price, originalPrice, discount, description, imageUrl, inStock = true, rating }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative">
        <img src={imageUrl} alt={name} className="w-full h-52 object-cover" />
        {discount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-full">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="p-5">
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className={i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-black text-red-600">{price.toLocaleString("vi-VN")}₫</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">{originalPrice.toLocaleString("vi-VN")}₫</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg transition">−</button>
            <span className="w-9 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg transition">+</button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              added ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400"
            }`}
          >
            {added ? <><Check size={15} /> Đã thêm!</> : <><ShoppingCart size={15} /> Thêm vào giỏ</>}
          </button>
        </div>
      </div>
    </div>
  );
}
