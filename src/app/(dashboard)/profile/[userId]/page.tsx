import { ProfileView } from '@/components/profile/ProfileView';

export default function PublicProfilePage({ params }: { params: { userId: string } }) {
  return <ProfileView userId={params.userId} isOwner={false} />;
}
