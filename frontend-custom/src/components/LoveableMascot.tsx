import React from 'react';

interface LoveableMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const LoveableMascot: React.FC<LoveableMascotProps> = ({
  className = '',
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const [hasErrored, setHasErrored] = React.useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasErrored) {
      setHasErrored(true);
      e.currentTarget.src = '/placeholder.svg';
    }
  };

  const content = (
    <img
      src="/mascot-small.png"
      alt="DevMentorAI Mascot"
      className={`${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onError={handleError}
    />
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="border-0 bg-transparent p-0 inline-block"
      aria-label="DevMentorAI Mascot"
    >
      {content}
    </button>
  ) : (
    content
  );
};

export default LoveableMascot;
