'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateClass } from '@/lib/hooks';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const subjectOptions = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
].map((s) => ({ value: s, label: s }));

export function CreateClassModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateClass();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(subjectOptions[0].value);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setSubject(subjectOptions[0].value);
    setDescription('');
    setError('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const save = async () => {
    if (name.trim().length < 3) {
      setError('Class name must be at least 3 characters');
      return;
    }
    try {
      const created = await create.mutateAsync({
        name: name.trim(),
        subject,
        description: description.trim(),
      });
      toast.success(`“${created.name}” created · code ${created.joinCode}`);
      close();
    } catch {
      toast.error('Could not create class');
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create a class"
      description="Students can join instantly with the generated code."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={save} loading={create.isPending}>
            Create class
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Class name"
          placeholder="e.g. Computer Science 101"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
        />
        <Select
          label="Subject"
          options={subjectOptions}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Textarea
          label="Description"
          rows={3}
          placeholder="What will this class cover?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
}
