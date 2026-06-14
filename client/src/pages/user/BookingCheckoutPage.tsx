// import { useEffect, useState } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { LuArrowLeft, LuCalendar, LuEye, LuShare2 } from 'react-icons/lu';
// import { toast } from 'sonner';
// import { Badge, Spinner } from '@/components/atoms';
// import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
// import { blogApi } from '@/api/misc.api';
// import { formatDate } from '@/lib/utils';
// import { ROUTES } from '@/lib/constants';
// import type { Blog } from '@/types';

// export function BlogDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [blog, setBlog] = useState<Blog | null>(null);
//   const [related, setRelated] = useState<Blog[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         // Backend accepts either UUID or slug under /blogs/{id} — we try a list call as fallback
//         let b: Blog | null = null;
//         try {
//           const r = await blogApi.getById(id);
//           b = (r as any)?.data ?? (r as any);
//         } catch {
//           const list = await blogApi.list();
//           b = (list.data ?? []).find((x: Blog) => x.slug === id || x.id === id) ?? null;
//         }

//         if (cancelled) return;
//         if (!b) {
//           toast.error('Article not found');
//           navigate(ROUTES.BLOGS, { replace: true });
//           return;
//         }
//         setBlog(b);

//         // Pull a few related by overlapping tags
//         const tags = b.tags ?? [];
//         const list = (await blogApi.list()).data ?? [];
//         const rel = list
//           .filter((x) => x.id !== b!.id && (x.tags ?? []).some((t) => tags.includes(t)))
//           .slice(0, 3);
//         if (!cancelled) setRelated(rel);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [id, navigate]);

//   if (loading) return <div className="grid place-items-center h-[60vh]"><Spinner size="lg" /></div>;
//   if (!blog) return null;

//   return (
//     <article className="max-w-3xl mx-auto px-4 py-6">
//       <Breadcrumbs
//         items={[
//           { label: 'Blog', to: ROUTES.BLOGS },
//           { label: blog.title },
//         ]}
//         className="mb-4"
//       />

//       <Link to={ROUTES.BLOGS} className="inline-flex items-center gap-1 text-sm text-text-2 dark:text-dark-text-2 hover:text-primary-600 mb-4">
//         <LuArrowLeft className="h-4 w-4" /> All articles
//       </Link>

//       {/* Hero */}
//       <div className="flex flex-wrap gap-1 mb-3">
//         {(blog.tags ?? []).map((t) => <Badge key={t} variant="primary">#{t}</Badge>)}
//       </div>
//       <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{blog.title}</h1>
//       <div className="flex flex-wrap items-center gap-4 text-sm text-text-3 mt-3">
//         <span className="inline-flex items-center gap-1"><LuCalendar className="h-4 w-4" />{formatDate(blog.createdAt ?? blog.created_at)}</span>
//         <span className="inline-flex items-center gap-1"><LuEye className="h-4 w-4" />{blog.view_count ?? 0} views</span>
//         <button
//           onClick={() => {
//             navigator.clipboard.writeText(window.location.href);
//             toast.success('Link copied');
//           }}
//           className="inline-flex items-center gap-1 hover:text-primary-600"
//         >
//           <LuShare2 className="h-4 w-4" /> Share
//         </button>
//       </div>

//       {blog.image && (
//         <img src={blog.image} alt={blog.title} className="w-full rounded-2xl mt-6 aspect-[16/9] object-cover" />
//       )}

//       <p className="text-lg text-text-2 dark:text-dark-text-2 mt-6 leading-relaxed">{blog.description}</p>

//       {blog.content && (
//         <div
//           className="prose prose-slate dark:prose-invert max-w-none mt-6"
//           dangerouslySetInnerHTML={{ __html: renderMarkdownish(blog.content) }}
//         />
//       )}

//       {/* Related */}
//       {related.length > 0 && (
//         <section className="mt-16 pt-8 border-t border-border dark:border-dark-border">
//           <h2 className="font-display text-xl font-semibold mb-4">You may also like</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {related.map((r) => (
//               <Link key={r.id} to={ROUTES.BLOG_DETAIL(r.slug || r.id)} className="rounded-xl overflow-hidden border border-border dark:border-dark-border hover:shadow-card transition">
//                 {r.image && <img src={r.image} alt={r.title} className="aspect-[4/3] w-full object-cover" />}
//                 <div className="p-3">
//                   <h3 className="font-medium line-clamp-2 text-sm">{r.title}</h3>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </section>
//       )}
//     </article>
//   );
// }

// /** Tiny "markdownish" renderer — bolds, lists, paragraphs, h1/h2. */
// function renderMarkdownish(text: string): string {
//   return text
//     .replace(/^### (.*)$/gm, '<h3>$1</h3>')
//     .replace(/^## (.*)$/gm, '<h2>$1</h2>')
//     .replace(/^# (.*)$/gm, '<h1>$1</h1>')
//     .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.+?)\*/g, '<em>$1</em>')
//     .replace(/^- (.+)$/gm, '<li>$1</li>')
//     .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
//     .split(/\n\n/)
//     .map((p) => (p.startsWith('<') ? p : `<p>${p}</p>`))
//     .join('\n');
// }
