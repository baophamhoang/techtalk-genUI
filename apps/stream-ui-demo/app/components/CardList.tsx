import { ProductCard } from "./ProductCard";

export interface CardListProps {
  title: string;
  cards: Array<{
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    price?: string;
    rating?: number;
  }>;
}

export function CardList({ title, cards }: CardListProps) {
  return (
    <div className="space-y-4 my-4">
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(card => (
          <ProductCard
            key={card.id}
            name={card.title}
            description={card.description || ""}
            price={card.price ? parseInt(card.price.replace(/[^\d]/g, "")) || 0 : 0}
            rating={card.rating}
            imageUrl={"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"}
          />
        ))}
      </div>
    </div>
  );
}
