import { CATEGORY_LABELS } from '@/lib/categories'

export default function CategoryBadge({ category }: { category: string }) {
  return <span className="tag">{CATEGORY_LABELS[category] ?? category}</span>
}
