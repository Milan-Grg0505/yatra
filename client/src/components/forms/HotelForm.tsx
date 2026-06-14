import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Select, Textarea } from '@/components/atoms';
import { ImageUpload, MultiSelect, type ImageUploadValue } from '@/components/molecules';
import { hotelApi } from '@/api/hotel.api';
import { cityApi, facilityApi, policyApi } from '@/api/misc.api';
import { hotelSchema, type HotelInput } from '@/lib/validation/domain.schema';
import { HOTEL_TYPES, CANCELLATION_POLICIES } from '@/lib/constant';
import type { City, Facility, Hotel, Policy } from '@/types';

interface HotelFormProps {
  editing: Hotel | null;
  onDone: () => void;
  /** 'owner' hides the status field and forces status = pending on create. */
  variant?: 'admin' | 'owner';
}

export function HotelForm({ editing, onDone, variant = 'admin' }: HotelFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [logo, setLogo] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [gallery, setGallery] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [status, setStatus] = useState<'approved' | 'pending' | 'rejected'>('pending');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HotelInput>({
    resolver: zodResolver(hotelSchema as any),
  });

  useEffect(() => {
    cityApi.list().then((r) => setCities(r.data ?? []));
    facilityApi.list().then((r) => setFacilities(r.data ?? []));
    policyApi.list().then((r) => setPolicies(r.data ?? []));
  }, []);

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        email: editing.email ?? '',
        phone: editing.phone ?? '',
        description: editing.description ?? '',
        type: editing.type,
        city_id: typeof editing.city_id === 'object' ? editing.city_id?.id : (editing.city_id as string) ?? '',
        address: editing.address ?? '',
        street: editing.street ?? '',
        zip_code: editing.zip_code ?? '',
        latitude: editing.latitude,
        longitude: editing.longitude,
        check_in_time: editing.check_in_time,
        check_out_time: editing.check_out_time,
        cancellation_policy: editing.cancellation_policy,
        tax_percentage: editing.tax_percentage,
        service_charge_percentage: editing.service_charge_percentage,
      });
      setStatus(editing.status);
      setSelectedFacilities(
        (editing.facilities ?? []).map((f) => (typeof f === 'object' ? f.id : f)) as string[],
      );
      setLogo({ files: [], existing: editing.logo ? [editing.logo] : [] });
      const photos = (editing as any).photos as Array<{ url: string }> | undefined;
      setGallery({ files: [], existing: photos?.map((p) => p.url) ?? [] });
    } else {
      reset({
        type: 'hotel',
        cancellation_policy: 'flexible',
        check_in_time: '14:00',
        check_out_time: '12:00',
        tax_percentage: 13,
        service_charge_percentage: 10,
      });
      setStatus('pending');
      setSelectedFacilities([]);
      setSelectedPolicies([]);
      setLogo({ files: [], existing: [] });
      setGallery({ files: [], existing: [] });
    }
  }, [editing, reset]);

  const onSubmit = async (data: HotelInput) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      fd.append(k, String(v));
    });
    selectedFacilities.forEach((id) => fd.append('facilities[]', id));
    selectedPolicies.forEach((id) => fd.append('policies[]', id));
    // Admin can set status; owner is always pending on create
    if (variant === 'admin') fd.append('status', status);
    if (logo.files[0]) fd.append('logo', logo.files[0]);
    gallery.files.forEach((f) => fd.append('images', f));

    try {
      if (editing) await hotelApi.update(editing.id, fd);
      else await hotelApi.create(fd);
      toast.success(
        editing
          ? 'Hotel updated'
          : variant === 'owner'
            ? 'Hotel submitted — pending admin approval'
            : 'Hotel created',
      );
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save hotel');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Hotel name" {...register('name')} error={errors.name?.message} />
        <Select
          label="Type"
          {...register('type')}
          options={HOTEL_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      </div>
      <Input label="PAN number" {...register('pan_number')} error={errors.pan_number?.message} hint="Format: ABCDE1234F" />
      <Textarea label="Description" rows={3} {...register('description')} />

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="City"
          {...register('city_id')}
          error={errors.city_id?.message}
          options={[{ value: '', label: 'Select city…' }, ...cities.map((c) => ({ value: c.id, label: c.name }))]}
        />
        <Input label="Address" {...register('address')} error={errors.address?.message} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Street" {...register('street')} />
        <Input label="Zip code" {...register('zip_code')} />
        <Input label="Latitude" type="number" step="any" {...register('latitude')} />
      </div>
      <Input label="Longitude" type="number" step="any" {...register('longitude')} />

      {/* Facilities & policies */}
      <MultiSelect
        label="Facilities"
        options={facilities.map((f) => ({ value: f.id, label: f.name }))}
        value={selectedFacilities}
        onChange={setSelectedFacilities}
        placeholder="Select facilities…"
      />
      <MultiSelect
        label="Policies"
        options={policies.map((p) => ({ value: p.id, label: p.title }))}
        value={selectedPolicies}
        onChange={setSelectedPolicies}
        placeholder="Select policies…"
      />

      {/* Operations & pricing */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Check-in time" {...register('check_in_time')} />
        <Input label="Check-out time" {...register('check_out_time')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Cancellation policy"
          {...register('cancellation_policy')}
          options={CANCELLATION_POLICIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))}
        />
        <Input label="Tax %" type="number" {...register('tax_percentage')} />
        <Input label="Service charge %" type="number" {...register('service_charge_percentage')} />
      </div>

      {/* Images */}
      <ImageUpload label="Logo" value={logo} onChange={setLogo} />
      <ImageUpload label="Gallery images" multiple value={gallery} onChange={setGallery} />

      {/* Status — admin only */}
      {variant === 'admin' && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Status</label>
          <div className="flex gap-2">
            {(['approved', 'pending', 'rejected'] as const).map((s) => (
              <label
                key={s}
                className="flex-1 cursor-pointer border border-border dark:border-dark-border rounded-lg p-2 text-center text-sm capitalize has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:text-primary-700 dark:has-[:checked]:bg-primary-900/30"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-border dark:border-dark-border">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{editing ? 'Save changes' : 'Create hotel'}</Button>
      </div>
    </form>
  );
}
