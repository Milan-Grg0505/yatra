import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  LuArrowLeft, LuArrowRight, LuBuilding2, LuBedDouble,
  LuSparkles, LuImage, LuFileText, LuCircleCheckBig, LuMailWarning,
} from 'react-icons/lu';
import {
  Avatar, Badge, Button, Input, Select, Switch, Textarea,
} from '@/components/atoms';
import { Stepper, type Step } from '@/components/molecules/Stepper';
import { ImageUpload, type ImageUploadValue } from '@/components/molecules/ImageUpload';
import { MultiSelect } from '@/components/molecules/MultiSelect';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAuth } from '@/features/slices/authSlice';
import { selectHotel } from '@/features/slices/hotelSlice';
import { fetchMyHotelsThunk } from '@/features/thunks/hotelThunks';
import { hotelApi } from '@/api/hotel.api';
import { authApi } from '@/api/auth.api';
import { roomApi } from '@/api/room.api';
import { cityApi, facilityApi, policyApi, serviceApi } from '@/api/misc.api';
import { HOTEL_TYPES, ROUTES } from '@/lib/constant';
import { cn } from '@/lib/utils';
import type { City, Facility, Policy, Service } from '@/types';

/* ------------------------------------------------------------------ */
/*  Schemas — one per step so we can validate progressively            */
/* ------------------------------------------------------------------ */

const basicSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['resort', 'hostel', 'hotel', 'homestay', 'other']),
  pan_number: z.string().min(3, 'PAN is required'),
  registration_number: z.string().min(3, 'Registration number is required'),
  city_id: z.string().uuid('Select a city'),
  description: z.string().min(20, 'Tell guests a bit about your property (at least 20 chars)'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone').optional().or(z.literal('')),
  address: z.string().optional(),
});
type BasicInput = z.infer<typeof basicSchema>;

const roomSchema = z.object({
  room_type: z.enum(['single', 'double', 'suite', 'deluxe', 'family', 'other']),
  room_name: z.string().min(2, 'Room name required'),
  bed_type: z.enum(['single', 'double', 'queen', 'king', 'bunk', 'sofa', 'other']),
  number_of_beds: z.coerce.number().int().min(1),
  smoking_policy: z.enum(['smoking', 'non-smoking', 'both']),
  base_price: z.coerce.number().min(1, 'Price required'),
  max_guest: z.coerce.number().int().min(1),
  number_of_rooms: z.coerce.number().int().min(1),
  room_size: z.string().optional(),
});
type RoomDraft = z.infer<typeof roomSchema> & { service_ids: string[] };

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS: Step[] = [
  { key: 'basic', label: 'Basic Info', description: 'Tell us about your property' },
  { key: 'rooms', label: 'Rooms & Pricing', description: 'Add your rooms' },
  { key: 'facilities', label: 'Facilities', description: 'What you offer' },
  { key: 'photos', label: 'Photos', description: 'Show it off' },
  { key: 'policies', label: 'Policies', description: 'Rules of stay' },
];

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */
export function RegisterPropertyPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { myHotels, loading: hotelsLoading } = useAppSelector(selectHotel);

  // ---- One-hotel-per-owner gate -----------------------------------
  useEffect(() => {
    dispatch(fetchMyHotelsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!hotelsLoading && myHotels.length > 0) {
      toast.info('You already have a registered property — manage it from your dashboard.');
      navigate(ROUTES.OWNER.HOTELS, { replace: true });
    }
  }, [hotelsLoading, myHotels.length, navigate]);

  // 🆕 GATE: owners must be verified before they can list a property
  if (!user?.is_email_verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[{ label: 'Owner dashboard', to: ROUTES.OWNER.DASHBOARD }, { label: 'Register property' }]}
          className="mb-4"
        />
        <div className="rounded-2xl bg-warning/5 border border-warning/30 p-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning mb-4">
            <LuMailWarning className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Verify your account first</h1>
          <p className="text-sm text-text-2 dark:text-dark-text-2 mt-2 max-w-md mx-auto">
            Only verified owners can register a property. Confirm the 6-digit code we sent to{' '}
            <span className="font-medium">{user?.email}</span>, or ask an admin to approve your account.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button asChild>
              <Link to={ROUTES.VERIFY_OTP} state={{ email: user?.email, type: 'verification' }}>
                Enter code
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await authApi.sendOtp({ email: user!.email, type: 'verification' });
                  toast.success('A fresh code is on the way');
                } catch (e: any) {
                  toast.error(e?.message ?? 'Could not send code');
                }
              }}
            >
              Resend code
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState(0);

  // ---- Per-step state ---------------------------------------------
  const [basic, setBasic] = useState<BasicInput | null>(null);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [logo, setLogo] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [gallery, setGallery] = useState<ImageUploadValue>({ files: [], existing: [] });
  const [policies, setPolicies] = useState<string[]>([]);

  // ---- Reference data ---------------------------------------------
  const [cities, setCities] = useState<City[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cityApi.list().then((r) => setCities(r.data ?? []));
    facilityApi.list().then((r) => setFacilities(r.data ?? []));
    serviceApi.list().then((r) => setServices(r.data ?? []));
  }, []);

  const canGoNext = useMemo(() => {
    if (step === 0) return !!basic;
    if (step === 1) return rooms.length > 0;
    return true;
  }, [step, basic, rooms.length]);

  /* ---------------------------------------------------------------- */
  /*  Final submission                                                 */
  /* ---------------------------------------------------------------- */
  const handleSubmit = async () => {
    if (!basic) return;
    setSubmitting(true);
    try {
      // 1. Create hotel (multipart)
      const fd = new FormData();
      Object.entries(basic).forEach(([k, v]) => v && fd.append(k, String(v)));
      selectedFacilities.forEach((id) => fd.append('facility_ids[]', id));
      if (logo.files[0]) fd.append('logo', logo.files[0]);
      gallery.files.forEach((f) => fd.append('images', f));

      const hotelRes = await hotelApi.create(fd);
      const hotelId = (hotelRes as any)?.data?.id ?? (hotelRes as any)?.id;
      if (!hotelId) throw new Error('Hotel creation succeeded but no id returned');

      // 2. Create rooms in parallel
      await Promise.all(
        rooms.map((r) => {
          const roomFd = new FormData();
          Object.entries(r).forEach(([k, v]) => {
            if (k === 'service_ids' || v === undefined) return;
            roomFd.append(k, String(v));
          });
          roomFd.append('hotel_id', hotelId);
          (r.service_ids ?? []).forEach((id) => roomFd.append('service_ids[]', id));
          return roomApi.create(roomFd);
        }),
      );

      // 3. Persist policies (each as its own row tied to the hotel)
      await Promise.all(
        policies.map((title) => policyApi.create({ title, hotel_id: hotelId } as any)),
      );

      toast.success('Property submitted! Our admin team will review it shortly.');
      navigate(ROUTES.OWNER.HOTELS, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not submit property');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Owner dashboard', to: ROUTES.OWNER.DASHBOARD },
          { label: 'Register property' },
        ]}
        className="mb-4"
      />

      <div className="flex items-center gap-3 mb-2">
        <Avatar name={user?.name ?? 'Owner'} size="sm" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">List your property on Yatra</h1>
          <p className="text-sm text-text-2 dark:text-dark-text-2">
            5 quick steps — you can save and continue later from your dashboard.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-card">
        <Stepper steps={STEPS} currentIndex={step} onStepClick={setStep} />

        <div className="mt-8 min-h-[400px]">
          {step === 0 && (
            <BasicStep
              cities={cities}
              defaultValues={basic ?? undefined}
              onValid={(d) => {
                setBasic(d);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <RoomsStep
              rooms={rooms}
              setRooms={setRooms}
              services={services}
            />
          )}
          {step === 2 && (
            <FacilitiesStep
              facilities={facilities}
              value={selectedFacilities}
              onChange={setSelectedFacilities}
            />
          )}
          {step === 3 && (
            <PhotosStep logo={logo} setLogo={setLogo} gallery={gallery} setGallery={setGallery} />
          )}
          {step === 4 && <PoliciesStep value={policies} onChange={setPolicies} />}
        </div>

        {/* Footer nav — Back / Next / Submit */}
        <div className="mt-8 flex justify-between border-t border-border dark:border-dark-border pt-5">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <LuArrowLeft className="h-4 w-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            step === 0 ? (
              // Step 0 needs to submit the inner form to validate before advancing
              <Button form="register-basic-form" type="submit">
                Next <LuArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext}>
                Next <LuArrowRight className="h-4 w-4" />
              </Button>
            )
          ) : (
            <Button onClick={handleSubmit} loading={submitting} size="lg">
              <LuCircleCheckBig className="h-5 w-5" /> Submit for review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Basic info                                                */
/* ================================================================== */
function BasicStep({
  cities,
  defaultValues,
  onValid,
}: {
  cities: City[];
  defaultValues?: BasicInput;
  onValid: SubmitHandler<BasicInput>;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<BasicInput>({
    resolver: zodResolver(basicSchema),
    defaultValues: defaultValues ?? { type: 'hotel' },
  });

  return (
    <form id="register-basic-form" onSubmit={handleSubmit(onValid)} className="space-y-4">
      <SectionHeader icon={<LuBuilding2 />} title="Enter your property's details and address" />

      <Input label="Name of the Property *" {...register('name')} error={errors.name?.message} placeholder="e.g. Hotel Yak & Yeti" />

      <Select
        label="Type of the Property *"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: '', label: 'Select Property Type' },
          ...HOTEL_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) })),
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="PAN Number *" {...register('pan_number')} error={errors.pan_number?.message} />
        <Input label="Registration Number *" {...register('registration_number')} error={errors.registration_number?.message} />
      </div>

      <Select
        label="City *"
        {...register('city_id')}
        error={errors.city_id?.message}
        options={[{ value: '', label: 'Select City' }, ...cities.map((c) => ({ value: c.id, label: c.name }))]}
      />

      <Textarea label="Description *" rows={4} {...register('description')} error={errors.description?.message} placeholder="Help guests picture their stay…" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Input label="Address" {...register('address')} />
      </div>
    </form>
  );
}

/* ================================================================== */
/*  STEP 2 — Rooms                                                     */
/* ================================================================== */
function RoomsStep({
  rooms,
  setRooms,
  services,
}: {
  rooms: RoomDraft[];
  setRooms: (r: RoomDraft[]) => void;
  services: Service[];
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomDraft>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      room_type: 'single', bed_type: 'double', smoking_policy: 'non-smoking',
      number_of_beds: 1, max_guest: 2, number_of_rooms: 1, service_ids: [],
    } as any,
  });
  const [serviceIds, setServiceIds] = useState<string[]>([]);

  const onAdd = (data: RoomDraft) => {
    setRooms([...rooms, { ...data, service_ids: serviceIds }]);
    reset();
    setServiceIds([]);
    toast.success(`Room "${data.room_name}" added`);
  };

  const remove = (idx: number) => setRooms(rooms.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <SectionHeader icon={<LuBedDouble />} title="Room Layouts & Pricing" subtitle="Add at least one room type to continue" />

      {/* Existing rooms */}
      {rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-border dark:border-dark-border bg-surface-2 dark:bg-dark-surface-2 flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.room_name}</p>
                <p className="text-xs text-text-3 capitalize">{r.room_type} • {r.bed_type} bed • Max {r.max_guest} guests</p>
                <p className="text-sm font-medium text-primary-600 mt-1">NPR {r.base_price}/night</p>
                <p className="text-xs text-text-3">{r.number_of_rooms} rooms available</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onAdd)} className="p-5 rounded-xl border border-dashed border-border dark:border-dark-border space-y-4">
        <h4 className="font-semibold">Add a room type</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Room Type *"
            {...register('room_type')}
            options={[
              { value: 'single', label: 'Single' }, { value: 'double', label: 'Double' },
              { value: 'suite', label: 'Suite' }, { value: 'deluxe', label: 'Deluxe' },
              { value: 'family', label: 'Family' }, { value: 'other', label: 'Other' },
            ]}
          />
          <Input label="Room Name *" {...register('room_name')} error={errors.room_name?.message} />
          <Select
            label="Bed Type *"
            {...register('bed_type')}
            options={[
              { value: 'single', label: 'Single Bed' }, { value: 'double', label: 'Double Bed' },
              { value: 'queen', label: 'Queen Bed' }, { value: 'king', label: 'King Bed' },
              { value: 'bunk', label: 'Bunk Bed' }, { value: 'sofa', label: 'Sofa Bed' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Number of Beds *" type="number" {...register('number_of_beds')} />
          <Select
            label="Smoking Policy *"
            {...register('smoking_policy')}
            options={[
              { value: 'non-smoking', label: 'Non-smoking' },
              { value: 'smoking', label: 'Smoking' },
              { value: 'both', label: 'Both available' },
            ]}
          />
          <Input label="Base Price (NPR) *" type="number" {...register('base_price')} error={errors.base_price?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Max guests *" type="number" {...register('max_guest')} />
          <Input label="Number of rooms *" type="number" {...register('number_of_rooms')} />
          <Input label="Room size" {...register('room_size')} placeholder="e.g. 30 m²" />
        </div>

        <MultiSelect
          label="Services included"
          options={services.map((s) => ({ value: s.id, label: s.name }))}
          value={serviceIds}
          onChange={setServiceIds}
          placeholder="Pick services for this room…"
        />

        <Button type="submit" variant="primary">+ Add room</Button>
      </form>
    </div>
  );
}

/* ================================================================== */
/*  STEP 3 — Facilities                                                */
/* ================================================================== */
function FacilitiesStep({
  facilities,
  value,
  onChange,
}: {
  facilities: Facility[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={<LuSparkles />} title="Facilities" subtitle="What does your property offer to guests?" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {facilities.filter((f) => f.active).map((f) => {
          const checked = value.includes(f.id);
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => toggle(f.id)}
              className={cn(
                'p-3 rounded-xl border-2 text-sm font-medium text-left transition',
                checked
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-border dark:border-dark-border hover:border-primary-400',
              )}
            >
              <span className="flex items-center justify-between">
                {f.name}
                {checked && <Badge variant="primary" className="text-[10px]">✓</Badge>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 4 — Photos                                                    */
/* ================================================================== */
function PhotosStep({
  logo, setLogo, gallery, setGallery,
}: {
  logo: ImageUploadValue;
  setLogo: (v: ImageUploadValue) => void;
  gallery: ImageUploadValue;
  setGallery: (v: ImageUploadValue) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={<LuImage />} title="Property Photos" subtitle="Upload a cover photo and gallery images. Good photos boost bookings." />
      <ImageUpload label="Cover photo (logo)" value={logo} onChange={setLogo} hint="One main photo shown in listings" />
      <ImageUpload label="Gallery images" multiple value={gallery} onChange={setGallery} hint="Up to 15 images — bedrooms, lobby, exterior, dining" />
    </div>
  );
}

/* ================================================================== */
/*  STEP 5 — Policies                                                  */
/* ================================================================== */
function PoliciesStep({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft('');
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <SectionHeader icon={<LuFileText />} title="Policies" subtitle="House rules guests will agree to — check-in time, smoking, pets, etc." />

      <div className="flex gap-2">
        <Input
          placeholder="e.g. Quiet hours 10pm – 6am"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          className="flex-1"
        />
        <Button type="button" onClick={add}>Add</Button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-text-3">No policies yet — feel free to add a few. You can always edit them later.</p>
      ) : (
        <ul className="space-y-2">
          {value.map((p, i) => (
            <li key={i} className="p-3 rounded-lg bg-surface-2 dark:bg-dark-surface-2 flex justify-between items-center gap-2">
              <span className="text-sm">{p}</span>
              <Button variant="ghost" size="sm" onClick={() => remove(i)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-9 w-9 grid place-items-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-text-2 dark:text-dark-text-2">{subtitle}</p>}
      </div>
    </div>
  );
}
