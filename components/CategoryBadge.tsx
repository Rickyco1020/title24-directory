import { BADGE_COLORS, CATEGORY_LABELS } from '@/lib/categories'

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${BADGE_COLORS[category] ?? 'bg-gray-100 text-gray-700'}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  )
}
