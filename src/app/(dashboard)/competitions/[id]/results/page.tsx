import { ResultsView } from '@/components/competitions';

export default function CompetitionResultsPage({ params }: { params: { id: string } }) {
  return <ResultsView id={params.id} />;
}
