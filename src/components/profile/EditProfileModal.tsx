'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { User } from '@/lib/types';
import { useUpdateProfile } from '@/lib/hooks';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export function EditProfileModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
}) {
  const update = useUpdateProfile();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');

  const save = async () => {
    if (name.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await update.mutateAsync({ name: name.trim(), bio: bio.trim(), phone: phone.trim() });
      toast.success('Profile updated');
      onClose();
    } catch {
      toast.error('Could not save changes');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Update how you appear across CompeteIQ."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={update.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea
          label="Bio"
          rows={3}
          placeholder="Tell others a little about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="Optional"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
    </Modal>
  );
}
