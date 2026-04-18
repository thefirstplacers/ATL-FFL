import Image from 'next/image';

interface ManagerAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  ring?: 'success' | 'danger' | 'gold' | 'none';
  dim?: boolean;
  priority?: boolean;
}

const ringClasses = {
  success: 'ring-2 ring-success',
  danger: 'ring-2 ring-danger',
  gold: 'ring-2 ring-gold',
  none: '',
};

export default function ManagerAvatar({
  src,
  alt,
  size = 40,
  className = '',
  ring = 'none',
  dim = false,
  priority = false,
}: ManagerAvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      unoptimized={src.startsWith('/managers/')}
      className={`rounded-full object-cover ${ringClasses[ring]} ${dim ? 'opacity-75' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
