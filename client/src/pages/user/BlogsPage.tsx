import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuCalendar, LuEye, LuSearch, LuTag } from 'react-icons/lu';
import { Badge, Input, Spinner } from '@/components/atoms';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { blogApi } from '@/api/misc.api';
import { formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constant';
import type { Blog } from '@/types';

export function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    blogApi.list().then((r) => setBlogs((r.data ?? []).filter((b) => b.published))).finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => Array.from(new Set(blogs.flatMap((b) => b.tags ?? []))).slice(0, 12), [blogs]);

  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      if (tag && !(b.tags ?? []).includes(tag)) return false;
      if (q && !b.title.toLowerCase().includes(q.toLowerCase()) && !(b.description ?? '').toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [blogs, q, tag]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Blog' }]} className="mb-4" />

      <header className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Travel stories & guides</h1>
        <p className="text-text-2 dark:text-dark-text-2 mt-2">
          Tips, itineraries, and hidden corners of Nepal — straight from our community.
        </p>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="pl-9" />
        </div>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${tag === t
              ? 'bg-primary-600 text-white'
              : 'bg-surface-2 dark:bg-dark-surface-2 text-text-2 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center h-60"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-20 text-text-2">No articles match those filters yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <Link
              key={b.id}
              to={ROUTES.BLOG_DETAIL(b.slug || b.id)}
              className="group rounded-2xl overflow-hidden bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:shadow-card hover:-translate-y-0.5 transition"
            >
              <div className="aspect-[4/3] overflow-hidden">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-surface-2 dark:bg-dark-surface-2 text-text-3">
                    <LuTag className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1 mb-2">
                  {(b.tags ?? []).slice(0, 3).map((t) => (
                    <Badge key={t} variant="default" className="text-[10px]">#{t}</Badge>
                  ))}
                </div>
                <h3 className="font-display text-lg font-semibold line-clamp-2 group-hover:text-primary-600 transition">{b.title}</h3>
                <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2 line-clamp-2">{b.description}</p>
                <div className="flex items-center gap-4 text-xs text-text-3 mt-4">
                  <span className="inline-flex items-center gap-1"><LuCalendar className="h-3.5 w-3.5" />{formatDate(b.createdAt)}</span>
                  <span className="inline-flex items-center gap-1"><LuEye className="h-3.5 w-3.5" />{b.view_count ?? 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
