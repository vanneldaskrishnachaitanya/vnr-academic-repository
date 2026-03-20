import { useEffect, useState } from 'react';
import { BarChart2, Loader2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { fetchUploadProgress } from '../api/apiClient';

const REGULATIONS = ['R25','R22','R19'];
const BRANCHES    = ['CSE','ECE','EEE','IT','MECH','CIVIL','AIML'];

function ProgressBar({ value, max=3 }) {
  const pct   = Math.min(100, Math.round((value/max)*100));
  const color = pct===100 ? 'var(--success)' : pct>=60 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="prog-bar-track">
      <div className="prog-bar-fill" style={{width:`${pct}%`, background:color}}/>
    </div>
  );
}

export default function UploadProgressPage() {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [regulation, setRegulation] = useState('R22');
  const [branch,     setBranch]     = useState('CSE');

  useEffect(() => {
    setLoading(true);
    fetchUploadProgress({ regulation, branch })
      .then(d => setData(d.progress || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [regulation, branch]);

  const total    = data.length;
  const complete = data.filter(s => s.mid1 && s.mid2 && s.semester).length;
  const pct      = total ? Math.round((complete/total)*100) : 0;

  return (
    <div className="progress-page">
      <h1 className="progress-page__title"><BarChart2 size={22}/> Upload Progress</h1>
      <p className="progress-page__sub">See which subjects still need papers uploaded.</p>

      <div className="progress-filters">
        <label className="modal__label" style={{flex:1}}>
          Regulation
          <select className="modal__select" value={regulation} onChange={e=>setRegulation(e.target.value)}>
            {REGULATIONS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="modal__label" style={{flex:1}}>
          Branch
          <select className="modal__select" value={branch} onChange={e=>setBranch(e.target.value)}>
            {BRANCHES.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </label>
      </div>

      {!loading && total>0 && (
        <div className="progress-overview">
          <div className="progress-overview__stat">
            <span className="progress-overview__val" style={{color:'var(--success)'}}>{complete}</span>
            <span className="progress-overview__label">Complete</span>
          </div>
          <div className="progress-overview__stat">
            <span className="progress-overview__val" style={{color:'var(--warning)'}}>{total-complete}</span>
            <span className="progress-overview__label">Incomplete</span>
          </div>
          <div className="progress-overview__stat">
            <span className="progress-overview__val">{pct}%</span>
            <span className="progress-overview__label">Overall</span>
          </div>
          <div className="progress-overview__bar"><ProgressBar value={complete} max={total}/></div>
        </div>
      )}

      {loading ? (
        <div className="sp-state sp-state--loading"><Loader2 size={26} className="spin"/></div>
      ) : data.length===0 ? (
        <div className="sp-state sp-state--empty"><BookOpen size={36}/><p>No subjects found for {regulation} · {branch}</p></div>
      ) : (
        <div className="progress-table">
          <div className="progress-table__header">
            <span>Subject</span><span>Mid-1</span><span>Mid-2</span><span>Semester</span><span>Progress</span>
          </div>
          {data.map((row,i) => {
            const count = [row.mid1,row.mid2,row.semester].filter(Boolean).length;
            return (
              <div key={i} className={`progress-row${count===3?' progress-row--complete':''}`}>
                <span className="progress-row__subject">
                  <BookOpen size={13}/> {row.subject}
                  {row.year&&row.sem&&<span className="progress-row__badge">Y{row.year} S{row.sem}</span>}
                </span>
                <span className="progress-row__check">{row.mid1  ?<CheckCircle size={16} style={{color:'var(--success)'}}/>:<AlertCircle size={16} style={{color:'var(--danger)'}}/>}</span>
                <span className="progress-row__check">{row.mid2  ?<CheckCircle size={16} style={{color:'var(--success)'}}/>:<AlertCircle size={16} style={{color:'var(--danger)'}}/>}</span>
                <span className="progress-row__check">{row.semester?<CheckCircle size={16} style={{color:'var(--success)'}}/>:<AlertCircle size={16} style={{color:'var(--danger)'}}/>}</span>
                <span className="progress-row__bar"><ProgressBar value={count} max={3}/></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
