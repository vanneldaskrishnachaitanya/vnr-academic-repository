import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, X } from 'lucide-react';

export default function RecentlyViewed() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ev-recent') || '[]');
      setRecent(stored.slice(0, 5));
    } catch {}
  }, []);

  // Track current page visit
  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    if (parts[1] === 'r' && parts.length >= 5) {
      try {
        const key = 'ev-recent';
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const entry = {
          path,
          label: decodeURIComponent(parts[4]),
          sub: `${parts[2]} · ${parts[3]}`,
          ts: Date.now(),
        };
        const filtered = stored.filter(r => r.path !== path).slice(0, 4);
        const updated = [entry, ...filtered];
        localStorage.setItem(key, JSON.stringify(updated));
        setRecent(updated);
      } catch {}
    }
  }, []);

  const remove = (path) => {
    const updated = recent.filter(r => r.path !== path);
    setRecent(updated);
    localStorage.setItem('ev-recent', JSON.stringify(updated));
  };

  if (recent.length === 0) return null;

  return (
    <section className="dash-section" style={{ marginTop: '2rem' }}>
      <h2 className="dash-section-title"><Clock size={13} /> Recently Viewed</h2>
      <div className="recent-list">
        {recent.map((r, i) => (
          <div key={i} className="recent-item">
            <Link to={r.path} className="recent-item__link">
              <div className="recent-item__body">
                <span className="recent-item__label">{r.label}</span>
                <span className="recent-item__sub">{r.sub}</span>
              </div>
              <ChevronRight size={13} className="recent-item__arrow" />
            </Link>
            <button className="recent-item__remove" onClick={() => remove(r.path)} title="Remove">
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
