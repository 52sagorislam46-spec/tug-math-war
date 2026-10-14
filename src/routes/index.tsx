import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpenCheck, Swords } from 'lucide-react';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Challenge Tug — অংক ও BCS কুইজ গেম' },
    { name: 'description', content: 'দুটি গেম এক জায়গায়: Tug of Math অংকের লড়াই এবং ১০ সেকেন্ডের BCS কুইজ চ্যালেঞ্জ।' },
    { property: 'og:title', content: 'Challenge Tug — অংক ও BCS কুইজ গেম' },
    { property: 'og:description', content: 'অংকের টাগ-অফ-ওয়ার আর বিসিএস প্রস্তুতির কুইজ — একটি বেছে নিন।' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Home,
});

function Home() {
  const cards = [
    { to: '/math' as const, icon: Swords, title: 'Tug of Math', sub: 'অংকের খেলা', desc: '১ বা ২ প্লেয়ার — দ্রুত অংক করে দড়ি টানুন।' },
    { to: '/bcs' as const, icon: BookOpenCheck, title: 'BCS কুইজ', sub: 'বিসিএস প্রস্তুতি', desc: 'প্রতি প্রশ্নে ১০ সেকেন্ড, ৪টি অপশন, শেষে ফলাফল।' },
  ];
  return <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
    <h1 className="mb-2 text-center text-3xl font-bold">কোন খেলাটি খেলবেন?</h1>
    <p className="mb-8 text-center text-muted-foreground">একটি বক্সে ক্লিক করুন</p>
    <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
      {cards.map(({ to, icon: Icon, title, sub, desc }) => <Link key={to} to={to} className="group rounded-2xl border-2 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon size={28} /></span>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{sub}</p>
        <p className="text-sm">{desc}</p>
      </Link>)}
    </div>
  </main>;
}
