import { CompetitionDetailView } from '@/components/competitions';

export default function CompetitionDetailPage({ params }: { params: { id: string } }) {
  return <CompetitionDetailView id={params.id} />;
}
