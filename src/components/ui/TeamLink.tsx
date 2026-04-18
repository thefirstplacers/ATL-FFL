import Link from 'next/link';
import { MANAGER_INFO } from '@/lib/constants';
import ManagerAvatar from './ManagerAvatar';

export default function TeamLink({
  ownerId,
  name,
  showPhoto = false,
  className = '',
}: {
  ownerId: string;
  name: string;
  showPhoto?: boolean;
  className?: string;
}) {
  const manager = MANAGER_INFO[ownerId];
  return (
    <Link
      href={`/teams/${ownerId}`}
      className={`hover:text-gold transition-colors inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded ${className}`}
    >
      {showPhoto && (
        <ManagerAvatar src={manager?.photo || '/managers/question.jpg'} alt={name} size={28} />
      )}
      <span className="hover:underline">{name}</span>
    </Link>
  );
}
