import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/atoms';
import { type Column } from '@/components/molecules/DataTable';
import { ResourceManager } from '@/components/organisms/ResourceManager';
import { BlogForm, CityForm, FacilityForm, ServiceForm, PolicyForm } from '@/components/forms';
import { cityApi, blogApi, facilityApi, serviceApi, } from '@/api/misc.api';
import { formatDate } from '@/lib/utils';
import type { City, Blog, Facility, Service, Policy } from '@/types';

/* ---------- Generic loader hook for misc resources ---------- */
function useResource<T>(fetcher: () => Promise<{ data?: T[] }>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetcher();
      setData(r.data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  return { data, loading, load };
}

/* ============================ CITIES ============================ */
export function AdminCitiesPage() {
  const { data, loading, load } = useResource<City>(() => cityApi.list());
  const columns: Column<City>[] = [
    {
      key: 'name',
      header: 'City',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          {c.image && <img src={c.image} alt="" className="h-8 w-8 rounded object-cover" />}
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    { key: 'country', header: 'Country' },
    { key: 'description', header: 'Description', render: (c) => <span className="text-text-2 line-clamp-1">{c.description ?? '—'}</span> },
  ];
  return (
    <ResourceManager<City>
      title="Cities" subtitle="Destinations on the platform" entityName="city"
      data={data} columns={columns} loading={loading} searchKey="name"
      getId={(c) => c.id} getLabel={(c) => c.name} onRefresh={load}
      onDelete={async (c) => { await cityApi.delete(c.id); toast.success('City deleted'); }}
      renderForm={({ editing, onDone }) => <CityForm editing={editing} onDone={onDone} />}
    />
  );
}

/* ============================ BLOGS ============================ */
export function AdminBlogsPage() {
  const { data, loading, load } = useResource<Blog>(() => blogApi.list());
  const columns: Column<Blog>[] = [
    { key: 'title', header: 'Title', sortable: true, render: (b) => <span className="font-medium">{b.title}</span> },
    { key: 'view_count', header: 'Views', sortable: true },
    { key: 'published', header: 'Status', render: (b) => <Badge variant={b.published ? 'success' : 'default'}>{b.published ? 'Published' : 'Draft'}</Badge> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (b) => formatDate(b.createdAt) },
  ];
  return (
    <ResourceManager<Blog>
      title="Blogs" subtitle="Travel stories & guides" entityName="blog"
      data={data} columns={columns} loading={loading} searchKey="title" modalSize="lg"
      getId={(b) => b.id} getLabel={(b) => b.title} onRefresh={load}
      onDelete={async (b) => { await blogApi.delete(b.id); toast.success('Blog deleted'); }}
      renderForm={({ editing, onDone }) => <BlogForm editing={editing} onDone={onDone} />}
    />
  );
}

/* ============================ FACILITIES ============================ */
export function AdminFacilitiesPage() {
  const { data, loading, load } = useResource<Facility>(() => facilityApi.list());
  const columns: Column<Facility>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (f) => <span className="font-medium">{f.name}</span> },
    { key: 'icon', header: 'Icon', render: (f) => f.icon ?? '—' },
    { key: 'active', header: 'Status', render: (f) => <Badge variant={f.active ? 'success' : 'default'}>{f.active ? 'Active' : 'Inactive'}</Badge> },
  ];
  return (
    <ResourceManager<Facility>
      title="Facilities" subtitle="Amenities hotels can offer" entityName="facility"
      data={data} columns={columns} loading={loading} searchKey="name" modalSize="sm"
      getId={(f) => f.id} getLabel={(f) => f.name} onRefresh={load}
      onDelete={async (f) => { await facilityApi.delete(f.id); toast.success('Facility deleted'); }}
      renderForm={({ editing, onDone }) => <FacilityForm editing={editing} onDone={onDone} />}
    />
  );
}

/* ============================ SERVICES ============================ */
export function AdminServicesPage() {
  const { data, loading, load } = useResource<Service>(() => serviceApi.list());
  const columns: Column<Service>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'icon', header: 'Icon', render: (s) => s.icon ?? '—' },
    { key: 'active', header: 'Status', render: (s) => <Badge variant={s.active ? 'success' : 'default'}>{s.active ? 'Active' : 'Inactive'}</Badge> },
  ];
  return (
    <ResourceManager<Service>
      title="Services" subtitle="Room & hotel services" entityName="service"
      data={data} columns={columns} loading={loading} searchKey="name" modalSize="sm"
      getId={(s) => s.id} getLabel={(s) => s.name} onRefresh={load}
      onDelete={async (s) => { await serviceApi.delete(s.id); toast.success('Service deleted'); }}
      renderForm={({ editing, onDone }) => <ServiceForm editing={editing} onDone={onDone} />}
    />
  );
}

/* ============================ POLICIES ============================ */
// export function AdminPoliciesPage() {
//   const { data, loading, load } = useResource<Policy>(() => policyApi.list());
//   const columns: Column<Policy>[] = [
//     { key: 'title', header: 'Title', sortable: true, render: (p) => <span className="font-medium">{p.title}</span> },
//     { key: 'description', header: 'Description', render: (p) => <span className="text-text-2 line-clamp-1">{p.description ?? '—'}</span> },
//     { key: 'hotel_id', header: 'Scope', render: (p) => <Badge variant={p.hotel_id ? 'primary' : 'default'}>{p.hotel_id ? 'Hotel' : 'Global'}</Badge> },
//   ];
//   return (
//     <ResourceManager<Policy>
//       title="Policies" subtitle="Booking & stay policies" entityName="policy"
//       data={data} columns={columns} loading={loading} searchKey="title"
//       getId={(p) => p.id} getLabel={(p) => p.title} onRefresh={load}
//       onDelete={async (p) => { await policyApi.delete(p.id); toast.success('Policy deleted'); }}
//       renderForm={({ editing, onDone }) => <PolicyForm editing={editing} onDone={onDone} />}
//     />
//   );
// }

/* ============================ COUPONS (placeholder) ============================ */
export function AdminCouponsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Coupons</h1>
      <div className="p-8 rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-center">
        <p className="text-text-2">Coupon management will be wired once backend routes are exposed.</p>
      </div>
    </div>
  );
}

/* ============================ SETTINGS ============================ */
export function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-4 max-w-2xl">
        <div className="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
          <h3 className="font-semibold mb-2">System</h3>
          <p className="text-sm text-text-2">App version, environment, and maintenance flags are managed in the backend .env.</p>
        </div>
      </div>
    </div>
  );
}
