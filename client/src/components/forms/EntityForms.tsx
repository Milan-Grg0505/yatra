import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Select, Switch, Textarea } from '@/components/atoms';
import { ImageUpload, type ImageUploadValue } from '@/components/molecules';
import { blogApi, cityApi, facilityApi, serviceApi } from '@/api/misc.api';
// import { hotelApi } from '@/api/hotel.api';
import { blogSchema, citySchema, heroSchema } from '@/lib/validation/domain.schema';
import { z } from 'zod';
import type { Blog, City, Facility, Service, Policy, Hotel } from '@/types';

/* ============================ BLOG ============================ */
type BlogInput = z.infer<typeof blogSchema> & { tagsString?: string };

export function BlogForm({ editing, onDone }: { editing: Blog | null; onDone: () => void }) {
  const [image, setImage] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [published, setPublished] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema.extend({ tagsString: z.string().optional() })) as any,
  });

  useEffect(() => {
    if (editing) {
      reset({ title: editing.title, description: editing.description, content: editing.content ?? '', tagsString: editing.tags?.join(', ') } as any);
      setPublished(editing.published);
      setImage({ files: [], existing: editing.image ? [editing.image] : [] });
    } else {
      reset({ title: '', description: '', content: '', tagsString: '' } as any);
      setPublished(true);
      setImage({ files: [], existing: [] });
    }
  }, [editing, reset]);

  const onSubmit = async (data: BlogInput) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    if (data.content) fd.append('content', data.content);
    fd.append('published', String(published));
    (data.tagsString ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => fd.append('tags[]', t));
    if (image.files[0]) fd.append('image', image.files[0]);
    try {
      if (editing) await blogApi.update(editing.id, fd);
      else await blogApi.create(fd);
      toast.success(editing ? 'Blog updated' : 'Blog created');
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" {...register('title')} error={errors.title?.message} />
      <Textarea label="Short description" rows={2} {...register('description')} error={errors.description?.message} />
      <Textarea label="Content" rows={6} {...register('content')} />
      <Input label="Tags (comma-separated)" {...register('tagsString' as any)} placeholder="trekking, pokhara, budget" />
      <ImageUpload label="Featured image" value={image} onChange={setImage} />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Published</span>
        <Switch checked={published} onCheckedChange={setPublished} />
      </div>
      <FormFooter editing={!!editing} submitting={isSubmitting} onCancel={onDone} entity="blog" />
    </form>
  );
}

/* ============================ CITY ============================ */
type CityInput = z.infer<typeof citySchema>;

export function CityForm({ editing, onDone }: { editing: City | null; onDone: () => void }) {
  const [image, setImage] = useState<ImageUploadValue>({ files: [], existing: [] });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CityInput>({
    resolver: zodResolver(citySchema as any),
    defaultValues: { country: 'Nepal' },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, country: editing.country ?? 'Nepal', description: editing.description ?? '', latitude: editing.latitude, longitude: editing.longitude });
      setImage({ files: [], existing: editing.image ? [editing.image] : [] });
    } else {
      reset({ name: '', country: 'Nepal', description: '' });
      setImage({ files: [], existing: [] });
    }
  }, [editing, reset]);

  const onSubmit = async (data: CityInput) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v !== undefined && v !== '' && fd.append(k, String(v)));
    if (image.files[0]) fd.append('image', image.files[0]);
    try {
      if (editing) await cityApi.update(editing.id, fd);
      else await cityApi.create(fd);
      toast.success(editing ? 'City updated' : 'City created');
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="City name" {...register('name')} error={errors.name?.message} />
      <Input label="Country" {...register('country')} />
      <Textarea label="Description" rows={2} {...register('description')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitude" type="number" step="any" {...register('latitude')} />
        <Input label="Longitude" type="number" step="any" {...register('longitude')} />
      </div>
      <ImageUpload label="City image" value={image} onChange={setImage} />
      <FormFooter editing={!!editing} submitting={isSubmitting} onCancel={onDone} entity="city" />
    </form>
  );
}

/* ============== SIMPLE NAME+ICON+ACTIVE (Facility / Service) ============== */
const namedSchema = z.object({
  name: z.string().min(1, 'Name required'),
  icon: z.string().optional(),
});
type NamedInput = z.infer<typeof namedSchema>;

function NamedActiveForm({
  editing,
  onDone,
  entity,
  api,
}: {
  editing: (Facility | Service) | null;
  onDone: () => void;
  entity: string;
  api: typeof facilityApi;
}) {
  const [active, setActive] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NamedInput>({
    resolver: zodResolver(namedSchema),
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, icon: editing.icon ?? '' });
      setActive(editing.active);
    } else {
      reset({ name: '', icon: '' });
      setActive(true);
    }
  }, [editing, reset]);

  const onSubmit = async (data: NamedInput) => {
    try {
      const payload = { ...data, active };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      toast.success(editing ? `${entity} updated` : `${entity} created`);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Icon (name or emoji)" {...register('icon')} placeholder="wifi / 🛜" hint="Lucide icon name or an emoji" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Active</span>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>
      <FormFooter editing={!!editing} submitting={isSubmitting} onCancel={onDone} entity={entity} />
    </form>
  );
}

export function FacilityForm({ editing, onDone }: { editing: Facility | null; onDone: () => void }) {
  return <NamedActiveForm editing={editing} onDone={onDone} entity="facility" api={facilityApi} />;
}
export function ServiceForm({ editing, onDone }: { editing: Service | null; onDone: () => void }) {
  return <NamedActiveForm editing={editing} onDone={onDone} entity="service" api={serviceApi as typeof facilityApi} />;
}

/* ============================ POLICY ============================ */
const policyFormSchema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().optional(),
  hotel_id: z.string().optional(),
});
type PolicyInput = z.infer<typeof policyFormSchema>;

export function PolicyForm({ editing, onDone }: { editing: Policy | null; onDone: () => void }) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PolicyInput>({
    resolver: zodResolver(policyFormSchema),
  });

  // useEffect(() => {
  //   hotelApi.list(1, 200).then((r) => setHotels(r.data ?? []));
  // }, []);

  useEffect(() => {
    if (editing) reset({ title: editing.title, description: editing.description ?? '', hotel_id: editing.hotel_id ?? '' });
    else reset({ title: '', description: '', hotel_id: '' });
  }, [editing, reset]);

  const onSubmit = async (data: PolicyInput) => {
    try {
      const payload = { title: data.title, description: data.description, ...(data.hotel_id ? { hotel_id: data.hotel_id } : {}) };
      // if (editing) await policyApi.update(editing.id, payload);
      // else await policyApi.create(payload);
      // toast.success(editing ? 'Policy updated' : 'Policy created');
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Policy title" {...register('title')} error={errors.title?.message} />
      <Textarea label="Description" rows={3} {...register('description')} />
      <Select
        label="Associated hotel (optional)"
        {...register('hotel_id')}
        options={[{ value: '', label: 'Global policy (no hotel)' }, ...hotels.map((h) => ({ value: h.id, label: h.name }))]}
      />
      <FormFooter editing={!!editing} submitting={isSubmitting} onCancel={onDone} entity="policy" />
    </form>
  );
}

/* ---------- shared footer ---------- */
function FormFooter({ editing, submitting, onCancel, entity }: { editing: boolean; submitting: boolean; onCancel: () => void; entity: string }) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-border dark:border-dark-border">
      <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit" loading={submitting}>{editing ? 'Save changes' : `Create ${entity}`}</Button>
    </div>
  );
}

// keep heroSchema import used (referenced by other admin tools later)
export const __heroSchema = heroSchema;
