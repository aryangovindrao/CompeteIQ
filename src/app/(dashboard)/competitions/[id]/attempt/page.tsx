import { AttemptView } from '@/components/competitions';

export default function AttemptPage({ params }: { params: { id: string } }) {
  return <AttemptView id={params.id} />;
}
