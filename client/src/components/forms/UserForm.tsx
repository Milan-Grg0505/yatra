import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button, Input, Select } from '@/components/atoms';
import { userApi } from '@/api/user.api';
import type { User } from '@/types';

const userFormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone').optional().or(z.literal('')),
  role: z.enum(['user', 'owner', 'admin']),
});
type UserFormInput = z.infer<typeof userFormSchema>;

interface UserFormProps {
  editing: User | null;
  onDone: () => void;
}

export function UserForm({ editing, onDone }: UserFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { role: 'user' },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, email: editing.email, phone: editing.phone ?? '', role: editing.role, password: '' });
    } else {
      reset({ name: '', email: '', phone: '', role: 'user', password: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data: UserFormInput) => {
    try {
      if (editing) {
        await userApi.adminUpdate(editing.id, {
          name: data.name,
          phone: data.phone,
          role: data.role,
        });
        toast.success('User updated');
      } else {
        const fd = new FormData();
        fd.append('name', data.name);
        fd.append('email', data.email);
        if (data.password) fd.append('password', data.password);
        if (data.phone) fd.append('phone', data.phone);
        fd.append('role', data.role);
        await userApi.adminAdd(fd);
        toast.success('User created');
      }
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save user');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" {...register('name')} error={errors.name?.message} />
      <Input label="Email" type="email" disabled={!!editing} {...register('email')} error={errors.email?.message} />
      {!editing && (
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} hint="Min 8 characters" />
      )}
      <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      <Select
        label="Role"
        {...register('role')}
        options={[
          { value: 'user', label: 'Traveler (user)' },
          { value: 'owner', label: 'Property Owner' },
          { value: 'admin', label: 'Admin' },
        ]}
      />
      <div className="flex justify-end gap-2 pt-4 border-t border-border dark:border-dark-border">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{editing ? 'Save changes' : 'Create user'}</Button>
      </div>
    </form>
  );
}
