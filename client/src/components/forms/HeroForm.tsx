// components/forms/HeroForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Textarea } from '@/components/atoms';
import { heroApi } from '@/api/misc.api';
import { toast } from 'sonner';
import type { Hero } from '@/types';
import { heroSchema } from '@/lib/validation/domain.schema';
import { ImageUpload } from '../molecules';


type HeroFormData = z.infer<typeof heroSchema>;

interface HeroFormProps {
  // editing can be a Hero object, null (from ResourceManager), or undefined (no edit mode)
  editing?: Hero | null;
  onDone: () => void;
}

export function HeroForm({ editing, onDone }: HeroFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema as any),
    defaultValues: {
      title: '',
      subTitle: '',
      description: '',
      link: '',
      order: 0,
      active: true,
      image: '',
    },
  });

  const imageUrl = watch('image');

  useEffect(() => {
    if (editing) {
      setValue('title', editing.title);
      setValue('subTitle', editing.subTitle ?? '');
      setValue('description', editing.description ?? '');
      setValue('link', editing.link ?? '');
      setValue('order', editing.order ?? 0);
      setValue('active', editing.active ?? true);
      setValue('image', editing.image ?? '');
    }
  }, [editing, setValue]);

  const onSubmit = async (data: HeroFormData) => {
    try {
      if (editing) {
        await heroApi.update(editing.id, data);
        toast.success('Hero banner updated');
      } else {
        await heroApi.create(data);
        toast.success('Hero banner created');
      }
      onDone();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to save hero banner');
    }
  };

  const handleImageUpload = (url: string) => {
    setValue('image', url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Discover the Himalayas"
        error={errors.title?.message}
        {...register('title')}
      />

      <Input
        label="Subtitle"
        placeholder="Find your perfect stay"
        error={errors.subTitle?.message}
        {...register('subTitle')}
      />

      <Textarea
        label="Description"
        placeholder="Book hotels, resorts, and homestays across Nepal."
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Link URL (optional)"
        placeholder="/hotels or https://example.com"
        error={errors.link?.message}
        {...register('link')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Display Order"
          type="number"
          min={0}
          placeholder="0"
          error={errors.order?.message}
          {...register('order', { valueAsNumber: true })}
        />

        <div className="flex items-center gap-2 mt-7">
          <input
            type="checkbox"
            id="active"
            className="h-4 w-4 rounded border-border"
            {...register('active')}
          />
          <label htmlFor="active" className="text-sm text-text-2">
            Active (visible on homepage)
          </label>
        </div>
      </div>

      <ImageUpload
        label="Hero Image"
        value={{ files: [], existing: imageUrl ? [imageUrl] : [] }}
        onChange={(val) => {
          setValue('image', val.existing?.[0] ?? '');
        }}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? 'Update' : 'Create'} Hero Banner
        </Button>
      </div>
    </form>
  );
}