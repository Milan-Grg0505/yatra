import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LuPlus, LuTrash2, LuX, LuCircleDollarSign, LuMap, LuCalendarDays, LuImage, LuListChecks } from 'react-icons/lu';
import { Badge, Button, Input, Select, Textarea } from '@/components/atoms';
import { ImageUpload, type ImageUploadValue } from '@/components/molecules/ImageUpload';
import { travelApi } from '@/api/travel.api';
import { cityApi } from '@/api/misc.api';
import type { City, TravelPackage } from '@/types';

/* ---------- validation ---------- */
const itinerarySchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().min(2, 'Title required'),
  description: z.string().default(''),
});

const packageSchema = z
  .object({
    name: z.string().min(3, 'Name is required'),
    description: z.string().min(10, 'Tell travelers a bit about the trip (min 10 chars)'),
    duration_days: z.coerce.number().int().min(1, 'At least 1 day'),
    duration_nights: z.coerce.number().int().min(0),
    price_per_person: z.coerce.number().min(0, 'Price required'),
    discount_price: z.coerce.number().min(0).optional().or(z.literal('').transform(() => undefined)),
    difficulty_level: z.enum(['easy', 'moderate', 'challenging']),
    group_size_min: z.coerce.number().int().min(1),
    group_size_max: z.coerce.number().int().min(1),
    status: z.enum(['active', 'inactive', 'upcoming']),
    start_city_id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
    end_city_id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
    itinerary: z.array(itinerarySchema).default([]),
  })
  .refine((d) => d.group_size_max >= d.group_size_min, {
    path: ['group_size_max'],
    message: 'Max must be ≥ min',
  })
  .refine((d) => !d.discount_price || d.discount_price < d.price_per_person, {
    path: ['discount_price'],
    message: 'Discount must be lower than full price',
  });

type PackageInput = z.infer<typeof packageSchema>;

interface TravelPackageFormProps {
  editing: TravelPackage | null;
  onDone: () => void;
}

export function TravelPackageForm({ editing, onDone }: TravelPackageFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [featured, setFeatured] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [gallery, setGallery] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [inclusionDraft, setInclusionDraft] = useState('');
  const [exclusionDraft, setExclusionDraft] = useState('');

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageInput>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      duration_days: 1,
      duration_nights: 0,
      price_per_person: 0,
      difficulty_level: 'easy',
      group_size_min: 1,
      group_size_max: 20,
      status: 'active',
      itinerary: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' });
  const watchedDays = Number(watch('duration_days'));

  // Load cities once
  useEffect(() => {
    cityApi.list().then((r) => setCities(r.data ?? []));
  }, []);

  // Hydrate when editing
  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        description: editing.description,
        duration_days: editing.duration_days,
        duration_nights: editing.duration_nights,
        price_per_person: editing.price_per_person,
        discount_price: editing.discount_price ?? undefined,
        difficulty_level: editing.difficulty_level,
        group_size_min: editing.group_size_min ?? 1,
        group_size_max: editing.group_size_max ?? 20,
        status: editing.status,
        start_city_id: (editing.start_city_id as string) ?? undefined,
        end_city_id: (editing.end_city_id as string) ?? undefined,
        itinerary: (editing.itinerary as any[])?.map((d: any) => ({
          day: d.day, title: d.title ?? '', description: d.description ?? '',
        })) ?? [],
      } as any);
      setInclusions(editing.inclusions ?? []);
      setExclusions(editing.exclusions ?? []);
      setFeatured({ files: [], existing: editing.featured_image ? [editing.featured_image] : [] });
      setGallery({ files: [], existing: editing.gallery_images ?? [] });
    } else {
      reset();
      setInclusions([]); setExclusions([]);
      setFeatured({ files: [], existing: [] });
      setGallery({ files: [], existing: [] });
    }
  }, [editing, reset]);

  /** Auto-pad / trim itinerary rows to match duration_days. */
  useEffect(() => {
    if (!Number.isFinite(watchedDays) || watchedDays < 1) return;
    if (watchedDays > fields.length) {
      for (let i = fields.length; i < Math.min(watchedDays, 30); i++) {
        append({ day: i + 1, title: '', description: '' } as any);
      }
    } else if (watchedDays < fields.length) {
      for (let i = fields.length; i > watchedDays; i--) remove(i - 1);
    }
  }, [watchedDays]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- submit ---------- */
  const onSubmit = async (data: PackageInput) => {
    // The backend takes JSON for packages (no multipart) — images are uploaded via the
    // separate `/upload` endpoint or stored as URLs. We send URLs (existing) + skip files
    // unless your travelApi supports multipart. Adjust if you switch to multipart.
    const payload = {
      ...data,
      inclusions,
      exclusions,
      itinerary: data.itinerary,
      featured_image: featured.existing[0] || undefined,
      gallery_images: gallery.existing,
    };

    try {
      if (editing) {
        await travelApi.update(editing.id, payload);
        toast.success('Package updated');
      } else {
        await travelApi.create(payload);
        toast.success('Package created');
      }
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save package');
    }
  };

  /* ---------- chip add/remove ---------- */
  const addChip = (list: string[], setList: (v: string[]) => void, draft: string, setDraft: (v: string) => void) => {
    const t = draft.trim();
    if (!t || list.includes(t)) return setDraft('');
    setList([...list, t]);
    setDraft('');
  };
  const removeChip = (list: string[], setList: (v: string[]) => void, i: number) =>
    setList(list.filter((_, idx) => idx !== i));

  /* ---------- render ---------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* Basic info */}
      <Section icon={<LuCalendarDays />} title="Basic info">
        <Input label="Package name *" {...register('name')} error={errors.name?.message} placeholder="e.g. Annapurna Base Camp Trek" />
        <Textarea label="Description *" rows={3} {...register('description')} error={errors.description?.message} placeholder="Highlights, route, what makes it special…" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Duration (days) *" type="number" min={1} {...register('duration_days')} error={errors.duration_days?.message} />
          <Input label="Nights *" type="number" min={0} {...register('duration_nights')} error={errors.duration_nights?.message} />
          <Select
            label="Difficulty *"
            {...register('difficulty_level')}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'challenging', label: 'Challenging' },
            ]}
          />
          <Select
            label="Status *"
            {...register('status')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'upcoming', label: 'Upcoming' },
            ]}
          />
        </div>
      </Section>

      {/* Pricing & group */}
      <Section icon={<LuCircleDollarSign />} title="Pricing & group size">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Price per person (NPR) *" type="number" min={0} {...register('price_per_person')} error={errors.price_per_person?.message} />
          <Input label="Discount price (NPR)" type="number" min={0} {...register('discount_price')} error={errors.discount_price?.message} hint="Optional — leave blank for full price only" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min group size *" type="number" min={1} {...register('group_size_min')} />
          <Input label="Max group size *" type="number" min={1} {...register('group_size_max')} error={errors.group_size_max?.message} />
        </div>
      </Section>

      {/* Cities */}
      <Section icon={<LuMap />} title="Route">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Starts in"
            {...register('start_city_id')}
            options={[{ value: '', label: '— pick a city —' }, ...cities.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Select
            label="Ends in"
            {...register('end_city_id')}
            options={[{ value: '', label: '— pick a city —' }, ...cities.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
      </Section>

      {/* Inclusions / exclusions */}
      <Section icon={<LuListChecks />} title="What's included / excluded">
        <ChipList
          label="Included"
          items={inclusions}
          draft={inclusionDraft}
          setDraft={setInclusionDraft}
          onAdd={() => addChip(inclusions, setInclusions, inclusionDraft, setInclusionDraft)}
          onRemove={(i) => removeChip(inclusions, setInclusions, i)}
          placeholder="e.g. Accommodation, meals, guide…"
          color="success"
        />
        <ChipList
          label="Not included"
          items={exclusions}
          draft={exclusionDraft}
          setDraft={setExclusionDraft}
          onAdd={() => addChip(exclusions, setExclusions, exclusionDraft, setExclusionDraft)}
          onRemove={(i) => removeChip(exclusions, setExclusions, i)}
          placeholder="e.g. Flights, personal expenses…"
          color="danger"
        />
      </Section>

      {/* Itinerary */}
      <Section icon={<LuCalendarDays />} title="Day-by-day itinerary">
        {fields.length === 0 ? (
          <p className="text-xs text-text-3">Set the duration above and we'll create itinerary rows for you.</p>
        ) : (
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div key={f.id} className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2 grid grid-cols-1 sm:grid-cols-[60px_1fr_2fr_auto] gap-2 items-end">
                <Input label="Day" type="number" {...register(`itinerary.${i}.day` as const)} />
                <Input label="Title" {...register(`itinerary.${i}.title` as const)} placeholder="Arrival in Kathmandu" />
                <Input label="Description" {...register(`itinerary.${i}.description` as const)} placeholder="Brief plan for the day" />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove day">
                  <LuTrash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ day: fields.length + 1, title: '', description: '' } as any)}>
              <LuPlus className="h-4 w-4" /> Add day
            </Button>
          </div>
        )}
      </Section>

      {/* Images */}
      <Section icon={<LuImage />} title="Images">
        <ImageUpload label="Featured image" value={featured} onChange={setFeatured} hint="One main hero photo" />
        <ImageUpload label="Gallery" multiple value={gallery} onChange={setGallery} hint="More photos — landscapes, activities, accommodation" />
      </Section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-1 px-1 pt-4 bg-surface dark:bg-dark-surface flex justify-end gap-2 border-t border-border dark:border-dark-border">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{editing ? 'Save changes' : 'Create package'}</Button>
      </div>
    </form>
  );
}

/* ---------- helpers ---------- */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex items-center gap-2 text-sm font-semibold text-text dark:text-dark-text">
        <span className="h-7 w-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 grid place-items-center">
          {icon}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipList({
  label, items, draft, setDraft, onAdd, onRemove, placeholder, color,
}: {
  label: string;
  items: string[];
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
  color: 'success' | 'danger';
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={onAdd}><LuPlus className="h-4 w-4" /> Add</Button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <Badge key={i} variant={color}>
              {item}
              <button type="button" onClick={() => onRemove(i)} className="ml-1 hover:opacity-70">
                <LuX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
