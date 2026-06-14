import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCamera, LuTrash2 } from 'react-icons/lu';
import { toast } from 'sonner';
import { Avatar, Badge, Button, Input, Switch } from '@/components/atoms';
import { Tabs } from '@/components/atoms/Overlays';
import { useAppDispatch, useAuth } from '@/hooks';
import {
  updateProfileThunk,
  uploadAvatarThunk,
  changePasswordThunk,
  logoutThunk,
} from '@/features/thunks/authThunks';
import { userApi } from '@/api/user.api';
import { changePasswordSchema } from '@/lib/validation/auth.validation';
import { profileSchema } from '@/lib/validation/domain.schema';
import { TRAVEL_STYLES, ROUTES, CURRENCIES, LANGUAGES } from '@/lib/constant';
import { cn } from '@/lib/utils';
import { z } from 'zod';

export function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [styles, setStyles] = useState<string[]>(user?.travel_style ?? []);
  const [activeTab, setActiveTab] = useState<string>('info');

  if (!user) return null;

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await dispatch(uploadAvatarThunk(file));
    if (uploadAvatarThunk.fulfilled.match(res)) {
      toast.success('Avatar updated');
    } else if (uploadAvatarThunk.rejected.match(res)) {
      const errMsg = (res.payload as string) || 'Upload failed';
      toast.error(errMsg);
    }
  };

  /* ----- Profile form ----- */
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? '', address: user.address ?? '' },
  });
  const onSaveProfile = async (data: any) => {
    const res = await dispatch(updateProfileThunk(data));
    if (updateProfileThunk.fulfilled.match(res)) toast.success('Profile updated');
  };

  /* ----- Password form ----- */
  type PwData = z.infer<typeof changePasswordSchema>;
  const pwForm = useForm<PwData>({ resolver: zodResolver(changePasswordSchema) });
  const onChangePw = async (data: PwData) => {
    const res = await dispatch(
      changePasswordThunk({ old_password: data.old_password, new_password: data.new_password }),
    );
    if (changePasswordThunk.fulfilled.match(res)) {
      toast.success('Password changed');
      pwForm.reset();
    }
  };

  /* ----- Preferences ----- */
  const savePreferences = async (patch: Record<string, any>) => {
    const res = await dispatch(updateProfileThunk(patch));
    if (updateProfileThunk.fulfilled.match(res)) toast.success('Preferences saved');
  };

  /* ----- Delete account ----- */
  const onDelete = async () => {
    if (!confirm('This will deactivate your account. Continue?')) return;
    await userApi.deleteAccount();
    await dispatch(logoutThunk());
    toast.success('Account deleted');
    navigate(ROUTES.HOME);
  };

  const tab = (label: string, content: React.ReactNode) => ({ value: label.toLowerCase(), label, content });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={user.image} name={user.name} size="xl" />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white grid place-items-center shadow"
          >
            <LuCamera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarPick} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">{user.name}</h1>
          <p className="text-text-2 text-sm">{user.email}</p>
          <Badge variant="primary" className="capitalize mt-1">{user.role}</Badge>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        className="mt-8"
        items={[
          tab(
            'Info',
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4 max-w-md">
              <Input label="Full name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
              <Input label="Phone" {...profileForm.register('phone')} error={profileForm.formState.errors.phone?.message} />
              <Input label="Address" {...profileForm.register('address')} />
              <Button type="submit">Save changes</Button>
            </form>,
          ),
          tab(
            'Password',
            <form onSubmit={pwForm.handleSubmit(onChangePw)} className="space-y-4 max-w-md">
              <Input label="Current password" type="password" {...pwForm.register('old_password')} error={pwForm.formState.errors.old_password?.message} />
              <Input label="New password" type="password" {...pwForm.register('new_password')} error={pwForm.formState.errors.new_password?.message} />
              <Input label="Confirm password" type="password" {...pwForm.register('confirm_password')} error={pwForm.formState.errors.confirm_password?.message} />
              <Button type="submit">Change password</Button>
            </form>,
          ),
          tab(
            'Preferences',
            <div className="space-y-6 max-w-md">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Switch
                  checked={user.preferences?.notifications ?? true}
                  onCheckedChange={(v) => savePreferences({ notifications: v })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  defaultValue={user.preferences?.language ?? 'en'}
                  onChange={(e) => savePreferences({ language: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface-2 px-3.5"
                >
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Currency</label>
                <select
                  defaultValue={user.preferences?.currency ?? 'NPR'}
                  onChange={(e) => savePreferences({ currency: e.target.value })}
                  className="w-full h-11 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface-2 px-3.5"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Travel style</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((s) => {
                    const active = styles.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const next = active ? styles.filter((x) => x !== s) : [...styles, s];
                          setStyles(next);
                          savePreferences({ travel_style: next });
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition',
                          active
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border',
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
          ),
          tab(
            'Danger',
            <div className="max-w-md">
              <div className="p-5 rounded-2xl border border-danger/40 bg-danger/5">
                <h3 className="font-semibold text-danger">Delete account</h3>
                <p className="text-sm text-text-2 mt-1">This will permanently deactivate your account.</p>
                <Button variant="danger" onClick={onDelete} className="mt-4">
                  <LuTrash2 className="h-4 w-4" /> Delete account
                </Button>
              </div>
            </div>,
          ),
        ]}
      />
    </div>
  );
}
