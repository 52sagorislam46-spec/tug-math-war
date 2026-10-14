import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Clock3, Play, RotateCcw, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { grade, optionLabel, pickRound, QUESTION_TIME, type BcsQuestion, type Outcome } from '@/lib/bcs-questions';

export const Route = createFileRoute('/bcs')({
  head: () => ({ meta: [
    { title: 'BCS কুইজ চ্যালেঞ্জ — প্রতি প্রশ্নে ১০ সেকেন্ড' },
    { name: 'description', content: 'বিসিএস প্রিলিমিনারি প্রস্তুতির কুইজ: প্রতি প্রশ্নে ১০ সেকেন্ড, ৪টি অপশন, স্কিপ এবং শেষে বিস্তারিত ফলাফল।' },
    { property: 'og:title', content: 'BCS কুইজ চ্যালেঞ্জ' },
    { property: 'og:description', content: 'প্রতি প্রশ্নে ১০ সেকেন্ডে বিসিএস প্রস্তুতি যাচাই করুন।' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: BcsQuiz,
});

const bn = (n: number) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);

function BcsQuiz() {
  const [status, setStatus] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [questions, setQuestions] = useState<BcsQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(QUESTION_TIME);
  const [results, setResults] = useState<Outcome[]>([]);

  const start = () => { setQuestions(pickRound()); setIndex(0); setSelected(null); setRemaining(QUESTION_TIME); setResults([]); setStatus('playing'); };
  const advance = (chosen: number | null) => {
    const q = questions[index];
    setResults(prev => [...prev, grade(q, chosen)]);
    setSelected(null); setRemaining(QUESTION_TIME);
    if (index + 1 >= questions.length) setStatus('finished'); else setIndex(index + 1);
  };
  const finishEarly = () => { setResults(prev => [...prev, ...questions.slice(index).map(q => grade(q, null))]); setStatus('finished'); };

  useEffect(() => {
    if (status !== 'playing') return;
    if (remaining <= 0) { advance(selected); return; }
    const t = window.setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => window.clearTimeout(t);
  }); // re-run every render while playing

  const correct = results.filter(r => r.status === 'correct').length;
  const wrong = results.filter(r => r.status === 'wrong').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const attempted = correct + wrong;
  const q = questions[index];

  return <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost"><Link to="/"><ArrowLeft /> হোম</Link></Button>
        <h1 className="text-xl font-bold">BCS কুইজ চ্যালেঞ্জ</h1>
        <span className="w-16" />
      </div>

      {status === 'ready' && <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-bold">প্রস্তুত?</h2>
        <ul className="mb-6 space-y-1 text-left text-sm text-muted-foreground">
          <li>• মোট {bn(Math.min(20, 52))}টি প্রশ্ন, প্রতিটির জন্য {bn(QUESTION_TIME)} সেকেন্ড</li>
          <li>• অপশনে ক্লিক করে টিক দিন, আবার ক্লিক করলে বাতিল হবে</li>
          <li>• "উত্তর দিন" চাপলে জমা হবে, "স্কিপ" চাপলে পরের প্রশ্নে যাবে</li>
          <li>• সময় শেষ হলে টিক দেওয়া উত্তর জমা হবে, না দিলে স্কিপ ধরা হবে</li>
        </ul>
        <Button size="lg" onClick={start}><Play /> শুরু করুন</Button>
      </div>}

      {status === 'playing' && q && <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">প্রশ্ন {bn(index + 1)} / {bn(questions.length)} · {q.subject}</span>
          <span className={`flex items-center gap-1 font-bold ${remaining <= 3 ? 'text-destructive' : ''}`}><Clock3 size={16} /> {bn(remaining)} সে.</span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full transition-all duration-1000 ease-linear ${remaining <= 3 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(remaining / QUESTION_TIME) * 100}%` }} />
        </div>
        <h2 className="mb-5 text-lg font-semibold leading-relaxed">{q.q}</h2>
        <div className="grid gap-3">
          {q.options.map((opt, i) => <button key={i} type="button" aria-pressed={selected === i} onClick={() => setSelected(selected === i ? null : i)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${selected === i ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold ${selected === i ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{selected === i ? <Check size={16} /> : optionLabel(i)}</span>
            <span>{opt}</span>
          </button>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button className="flex-1" disabled={selected === null} onClick={() => advance(selected)}><Check /> উত্তর দিন</Button>
          <Button variant="outline" className="flex-1" onClick={() => advance(null)}><SkipForward /> স্কিপ</Button>
          <Button variant="ghost" onClick={finishEarly}>শেষ করুন</Button>
        </div>
      </div>}

      {status === 'finished' && <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h2 className="mb-1 text-2xl font-bold">ফলাফল</h2>
          <p className="mb-4 text-muted-foreground">মোট প্রশ্ন {bn(results.length)}টি</p>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-primary/10 p-3"><div className="text-2xl font-bold">{bn(correct)}</div><div className="text-xs">সঠিক</div></div>
            <div className="rounded-xl bg-destructive/10 p-3"><div className="text-2xl font-bold text-destructive">{bn(wrong)}</div><div className="text-xs">ভুল</div></div>
            <div className="rounded-xl bg-muted p-3"><div className="text-2xl font-bold">{bn(skipped)}</div><div className="text-xs">স্কিপ</div></div>
          </div>
          <p className="mb-4 text-sm">নির্ভুলতা: <strong>{bn(attempted ? Math.round((correct / attempted) * 100) : 0)}%</strong></p>
          <Button onClick={start}><RotateCcw /> আবার খেলুন</Button>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 font-semibold">উত্তর পর্যালোচনা</h3>
          <ol className="space-y-3">
            {questions.map((item, i) => { const r = results[i]; return <li key={i} className="border-b pb-3 text-sm last:border-0">
              <p className="mb-1 font-medium">{bn(i + 1)}. {item.q}</p>
              <p className="flex items-center gap-1 text-primary"><Check size={14} /> সঠিক: {optionLabel(item.answer)}) {item.options[item.answer]}</p>
              {r?.status === 'wrong' && r.chosen !== null && <p className="flex items-center gap-1 text-destructive"><X size={14} /> আপনার উত্তর: {optionLabel(r.chosen)}) {item.options[r.chosen]}</p>}
              {r?.status === 'skipped' && <p className="text-muted-foreground">স্কিপ করা হয়েছে</p>}
            </li>; })}
          </ol>
        </div>
      </div>}
    </div>
  </div>;
}
