import Link from 'next/link'

type BreadcrumbItem = { label: string; href?: string }

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center space-x-2">
          {i > 0 && <span>›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-700 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
