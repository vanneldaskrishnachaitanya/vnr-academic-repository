import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  { emoji:'🎓', title:'Welcome to ExamVault!',         desc:'Your one-stop platform for VNRVJIET exam papers and subject resources. Let\'s take a quick tour!' },
  { emoji:'🗂️', title:'Browse by Regulation',          desc:'Click "Repository" → select your Regulation (R25/R22/R19) → Branch → Year → Semester → Subject folder.' },
  { emoji:'📤', title:'Upload Papers',                  desc:'Inside any subject, click "+ Paper" or "+ Resource". Admin reviews and approves your upload.' },
  { emoji:'⌨️', title:'Search Instantly',               desc:'Press "/" anywhere to open Global Search. Find any paper by name, subject, or branch in seconds.' },
  { emoji:'🔖', title:'Bookmark Subjects',              desc:'Click "Bookmark" on any subject page to save it for quick access from your Profile page.' },
  { emoji:'💻', title:'Competitive Programming',        desc:'Check the "Coding" tab for platforms, resources, and upcoming contest schedules!' },
  { emoji:'🏆', title:'Leaderboard',                   desc:'See the top contributors in the "Leaders" tab. Upload papers to climb the leaderboard!' },
  { emoji:'🎉', title:'You\'re all set!',               desc:'Start from the Dashboard → select your regulation. Happy studying and good luck! 🚀' },
];

export default function OnboardingTour({ onDone }) {
  const [step, setStep] = useState(0);
  const cur    = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboard-overlay">
      <div className="onboard-card">
        <button className="onboard-close" onClick={onDone}><X size={16} /></button>

        <div className="onboard-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`onboard-dot${i === step ? ' onboard-dot--active' : i < step ? ' onboard-dot--done' : ''}`} />
          ))}
        </div>

        <div className="onboard-emoji">{cur.emoji}</div>
        <h2 className="onboard-title">{cur.title}</h2>
        <p className="onboard-desc">{cur.desc}</p>

        <div className="onboard-actions">
          {step > 0 && (
            <button className="btn btn--ghost btn--sm" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button className="btn btn--primary" style={{ marginLeft: 'auto' }} onClick={() => isLast ? onDone() : setStep(s => s + 1)}>
            {isLast ? '🎉 Get Started' : <>Next <ChevronRight size={14} /></>}
          </button>
        </div>
        <button className="onboard-skip" onClick={onDone}>Skip tour</button>
      </div>
    </div>
  );
}
