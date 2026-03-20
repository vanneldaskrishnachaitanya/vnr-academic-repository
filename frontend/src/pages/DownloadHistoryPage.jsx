import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, ChevronRight, Loader2, Clock } from 'lucide-react';
import { fetchDownloadHistory } from '../api/apiClient';

export default function DownloadHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloadHistory()
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-page">
      <h1 className="history-page__title"><Download size={20} /> Download History</h1>
      {loading ? (
        <div className="sp-state sp-state--loading"><Loader2 size={26} className="spin" /> Loading…</div>
      ) : history.length === 0 ? (
        <div className="sp-state sp-state--empty"><Download size={36} /><p>No downloads yet</p></div>
      ) : (
        <div className="history-list">
          {history.map((item, i) => (
            <Link key={i}
              to={`/r/${item.regulation}/${item.branch}/${encodeURIComponent(item.subject || '')}`}
              className="history-item">
              <FileText size={16} className="history-item__icon" />
              <div className="history-item__body">
                <p className="history-item__name">{item.fileName}</p>
                <p className="history-item__meta">{item.regulation} · {item.branch} · {item.subject}</p>
              </div>
              <span className="history-item__time">
                <Clock size={11} />
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
              </span>
              <ChevronRight size={14} className="history-item__arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
