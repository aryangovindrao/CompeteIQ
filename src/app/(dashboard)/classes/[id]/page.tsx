import { ClassDetailView } from '@/components/classes';

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  return <ClassDetailView id={params.id} />;
}
