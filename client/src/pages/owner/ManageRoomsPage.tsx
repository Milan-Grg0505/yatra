import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge, Button, Input, Modal, Select, Skeleton } from '@/components/atoms';
import { roomApi } from '@/api/room.api';

import { ROOM_TYPES, BED_TYPES, VIEW_TYPES } from '@/lib/constant';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';
import { roomSchema, type RoomInput } from '@/lib/validation/domain.schema';

export function ManageRoomsPage() {
  const { id: hotelId } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  const load = async () => {
    if (!hotelId) return;
    setLoading(true);
    const r = await roomApi.list(hotelId);
    setRooms(r.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [hotelId]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema as any),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      hotel_id: hotelId,
      room_type: 'double',
      bed_type: 'double',
      smoking_policy: 'non-smoking',
      view_type: 'none',
      numberOf_rooms: 1,
      numberOf_beds: 1,
      max_guest: 2,
      base_price: 0,
      discount_percentage: 0,
      has_wifi: true,
      has_ac: false,
      has_tv: false,
      has_minibar: false,
      has_safe: false,
      amenities: [],
    } as any);
    setOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditing(r);
    reset({ ...r, hotel_id: hotelId } as any);
    setOpen(true);
  };

  const toSnake = (data: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
        v,
      ]),
    );

  const onSubmit = async (data: RoomInput) => {
    try {
      const payload = toSnake(data);
      if (editing) await roomApi.update(editing.id, payload as any);
      else await roomApi.create(payload as any);
      toast.success(editing ? 'Room updated' : 'Room created');
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete room?')) return;
    await roomApi.delete(id);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Manage rooms</h1>
        <Button onClick={openCreate}><LuPlus className="h-4 w-4" /> Add room</Button>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : rooms.length === 0 ? (
        <p className="text-text-3 text-center py-12">No rooms yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{r.room_name}</h3>
                  <p className="text-xs text-text-2 capitalize mt-1">{r.room_type} · {r.bed_type} bed</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(r)}><LuPencil className="h-4 w-4" /></Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => onDelete(r.id)}><LuTrash2 className="h-4 w-4 text-danger" /></Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge>{r.max_guest} guests</Badge>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(r.base_price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit room' : 'Add room'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Room name" {...register('room_name')} error={errors.room_name?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" {...register('room_type')} options={ROOM_TYPES.map(t => ({ value: t, label: t }))} />
            <Select label="Bed type" {...register('bed_type')} options={BED_TYPES.map(t => ({ value: t, label: t }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="No. of rooms" type="number" {...register('numberOf_rooms')} />
            <Input label="No. of beds" type="number" {...register('numberOf_beds')} />
            <Input label="Max guests" type="number" {...register('max_guest')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Base price (NPR)" type="number" {...register('base_price')} error={errors.base_price?.message} />
            <Input label="Discount %" type="number" {...register('discount_percentage')} />
          </div>
          <Select label="View" {...register('view_type')} options={VIEW_TYPES.map(t => ({ value: t, label: t }))} />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('has_wifi')} /> WiFi</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('has_ac')} /> AC</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('has_tv')} /> TV</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('has_minibar')} /> Mini bar</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
