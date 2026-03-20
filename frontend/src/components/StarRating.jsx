import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 16 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="star-rating" onMouseLeave={() => !readonly && setHover(0)}>
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          className={`star-btn${display >= s ? ' star-btn--filled' : ''}`}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          disabled={readonly}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <Star size={size} fill={display >= s ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
