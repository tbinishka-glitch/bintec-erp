import Image from 'next/image'

const SIZE_MAP = {
  xs:  { container: 'w-6 h-6',   text: 'text-[8px]',  radius: 'rounded-lg' },
  sm:  { container: 'w-8 h-8',   text: 'text-[10px]', radius: 'rounded-xl' },
  md:  { container: 'w-10 h-10', text: 'text-xs',     radius: 'rounded-xl' },
  lg:  { container: 'w-12 h-12', text: 'text-sm',     radius: 'rounded-2xl' },
  xl:  { container: 'w-16 h-16', text: 'text-xl',     radius: 'rounded-2xl' },
  '2xl': { container: 'w-24 h-24', text: 'text-3xl',  radius: 'rounded-3xl' },
}

interface UserAvatarProps {
  imageUrl?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: keyof typeof SIZE_MAP
  className?: string
  gradient?: string
}

export function UserAvatar({
  imageUrl,
  name,
  firstName,
  lastName,
  size = 'md',
  className = '',
  gradient = 'from-primary to-purple-800',
}: UserAvatarProps) {
  const { container, text, radius } = SIZE_MAP[size]
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : name
      ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : '?'

  if (imageUrl) {
    return (
      <div className={`${container} ${radius} overflow-hidden shrink-0 ${className}`}>
        <img
          src={imageUrl}
          alt={name || 'Staff member'}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`${container} ${radius} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 ${text} ${className}`}>
      {initials}
    </div>
  )
}
