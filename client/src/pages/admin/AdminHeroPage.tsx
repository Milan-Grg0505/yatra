// pages/admin/AdminHeroPage.tsx
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LuImage, LuCalendar, LuEye, LuEyeOff, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { Badge, Button } from '@/components/atoms';
import { type Column } from '@/components/molecules/DataTable';
import { ResourceManager } from '@/components/organisms/ResourceManager';

import { heroApi } from '@/api/misc.api';
import { formatDate } from '@/lib/utils';
import type { Hero } from '@/types';
import { HeroForm } from '@/components/forms/HeroForm';

/* ============================ HERO / BANNERS ============================ */
export function AdminHeroPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await heroApi.list();
      setHeroes(r.data ?? []);
    } catch (error) {
      console.error('Failed to load heroes:', error);
      toast.error('Failed to load hero banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      await heroApi.update(id, { order: newOrder } as any);
      // Reorder local state
      setHeroes((prev) => {
        const updated = prev.map((h) => (h.id === id ? { ...h, order: newOrder } : h));
        return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const toggleActive = async (hero: Hero) => {
    try {
      await heroApi.update(hero.id, { active: !hero.active } as any);
      setHeroes((prev) =>
        prev.map((h) => (h.id === hero.id ? { ...h, active: !h.active } : h))
      );
      toast.success(hero.active ? 'Banner deactivated' : 'Banner activated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns: Column<Hero>[] = [
    {
      key: 'image',
      header: 'Preview',
      render: (h) => (
        <div className="relative w-20 h-14 rounded-md overflow-hidden bg-surface-2">
          {h.image ? (
            <img src={h.image} alt={h.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LuImage className="h-5 w-5 text-text-3" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (h) => <span className="font-medium line-clamp-1">{h.title}</span>,
    },
    {
      key: 'sub_title',
      header: 'Subtitle',
      render: (h) => <span className="text-text-2 line-clamp-1">{h.subTitle ?? '—'}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      render: (h) => (
        <Badge variant={h.active ? 'success' : 'default'} className="gap-1">
          {h.active ? (
            <>
              <LuEye className="h-3 w-3" /> Active
            </>
          ) : (
            <>
              <LuEyeOff className="h-3 w-3" /> Inactive
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      sortable: true,
      render: (h) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono w-8 text-center">{h.order ?? 0}</span>
          <div className="flex flex-col">
            <button
              onClick={() => updateOrder(h.id, (h.order ?? 0) - 1)}
              disabled={h.order === 0}
              className="p-0.5 hover:bg-surface-2 rounded disabled:opacity-30"
            >
              <LuArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => updateOrder(h.id, (h.order ?? 0) + 1)}
              className="p-0.5 hover:bg-surface-2 rounded"
            >
              <LuArrowDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ResourceManager<Hero>
      title="Hero Banners"
      subtitle="Manage homepage carousel slides. Order determines display sequence."
      entityName="hero"
      data={heroes}
      columns={columns}
      loading={loading}
      searchKey="title"
      modalSize="lg"
      getId={(h) => h.id}
      getLabel={(h) => h.title}
      onRefresh={load}
      onDelete={async (h) => {
        await heroApi.delete(h.id);
        toast.success('Hero banner deleted');
        await load();
      }}
      renderForm={({ editing, onDone }) => (
        <HeroForm editing={editing} onDone={onDone} />
      )}
      extraActions={(hero) => (
        <Button
          size="sm"
          variant={hero.active ? 'outline' : 'ghost'}
          onClick={() => toggleActive(hero)}
          className="gap-1"
        >
          {hero.active ? (
            <>
              <LuEyeOff className="h-3.5 w-3.5" /> Deactivate
            </>
          ) : (
            <>
              <LuEye className="h-3.5 w-3.5" /> Activate
            </>
          )}
        </Button>
      )}
    />
  );
}