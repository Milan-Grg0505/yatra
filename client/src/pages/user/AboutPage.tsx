import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  LuArrowRight,
  LuShieldCheck,
  LuHeart,
  LuSparkles,
  LuUsers,
  LuHeadphones,
  LuTag,
  LuStar,
  LuMapPin,
  LuMail,
  LuPhone,
  LuBadgeCheck,
  LuCreditCard,
  LuCalendarCheck,
} from 'react-icons/lu';
import { Button, Input, Textarea, Avatar, Rating } from '@/components/atoms';
import { ROUTES } from '@/lib/constant';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';

/* ---------- Animated counter ---------- */
function Counter({ target, suffix = '', duration = 1600 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

const VALUES = [
  { icon: <LuStar className="h-6 w-6" />, title: 'Quality', desc: 'Every property is vetted for comfort and care.' },
  { icon: <LuShieldCheck className="h-6 w-6" />, title: 'Trust', desc: 'Verified reviews and secure payments, always.' },
  { icon: <LuSparkles className="h-6 w-6" />, title: 'Authenticity', desc: 'Real Nepali hospitality, from homestays to resorts.' },
  { icon: <LuHeart className="h-6 w-6" />, title: 'Customer first', desc: 'Friendly support whenever you need it.' },
];

const OFFERINGS = [
  { icon: <LuMapPin />, title: 'Wide range of hotels', desc: 'From budget hostels to luxury resorts across Nepal.' },
  { icon: <LuTag />, title: 'Best price guarantee', desc: 'Direct rates with no hidden booking fees.' },
  { icon: <LuHeadphones />, title: '24/7 customer support', desc: 'A real person ready to help, day or night.' },
  { icon: <LuCalendarCheck />, title: 'Easy cancellation', desc: 'Flexible policies so plans can change.' },
  { icon: <LuBadgeCheck />, title: 'Verified reviews', desc: 'Honest feedback from real guests.' },
  { icon: <LuCreditCard />, title: 'Secure payments', desc: 'eSewa, Khalti & cards — safe and simple.' },
];

const TEAM = [
  { name: 'Aarav Sharma', role: 'Founder & CEO', bio: 'Built Yatra to make Nepal travel effortless.' },
  { name: 'Sita Gurung', role: 'Head of Partnerships', bio: 'Connects the best stays to the platform.' },
  { name: 'Bikash Thapa', role: 'Lead Engineer', bio: 'Keeps the booking engine fast and reliable.' },
  { name: 'Priya Maharjan', role: 'Customer Success', bio: 'Makes sure every guest is looked after.' },
];

const TESTIMONIALS = [
  { name: 'Emily Chen', location: 'Singapore', rating: 5, text: 'Booked a lakeside hotel in Pokhara in minutes. Flawless experience and the views were unreal.' },
  { name: 'Robert Taylor', location: 'London, UK', rating: 5, text: 'The AI assistant helped me plan a 7-day trek. Support was incredible the whole way.' },
  { name: 'Anita Rai', location: 'Kathmandu, NP', rating: 4, text: 'Love that I can pay with eSewa. Found a great homestay near Nagarkot for the weekend.' },
];

const MILESTONES = [
  { year: '2021', label: 'Yatra founded in Kathmandu' },
  { year: '2022', label: 'First 1,000 bookings' },
  { year: '2023', label: 'Expanded to 20+ cities' },
  { year: '2024', label: 'Launched AI travel assistant' },
];

export function AboutPage() {
  const { register, handleSubmit, reset } = useForm<{ name: string; email: string; message: string }>();
  const onContact = () => {
    toast.success('Thanks for reaching out — we\'ll be in touch soon!');
    reset();
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 my-6">
        <Breadcrumbs items={[{ label: 'About' }]} />
      </div>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] grid place-items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=2000&q=80"
          alt="Himalayas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative text-center text-white px-4 max-w-3xl animate-fade-in">
          <span className="inline-block text-accent-400 font-medium tracking-wide uppercase text-sm mb-3">About Yatra</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            About Yatra — Your Travel Companion
          </h1>
          <p className="mt-4 text-lg text-white/90">Discover Nepal's Finest Hospitality</p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Our story</h2>
          <p className="mt-4 text-text-2 dark:text-dark-text-2 leading-relaxed">
            Yatra (यात्रा — "journey") began with a simple belief: exploring Nepal should be as
            joyful as the destination itself. We bring together hotels, homestays, resorts, and
            curated travel packages on one trustworthy platform — powered by honest reviews,
            transparent pricing, and a little help from AI.
          </p>
          <p className="mt-4 text-text-2 dark:text-dark-text-2 leading-relaxed">
            From the lakes of Pokhara to the peaks above Nagarkot, our mission is to connect
            travelers with authentic Nepali hospitality, while helping local hosts grow.
          </p>

          {/* Milestones */}
          <div className="mt-8 space-y-4">
            {MILESTONES.map((m) => (
              <div key={m.year} className="flex items-center gap-4">
                <span className="shrink-0 w-16 font-display text-xl font-bold text-primary-600">{m.year}</span>
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                <span className="text-text-2 dark:text-dark-text-2">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {VALUES.map((v) => (
            <div key={v.title} className="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                {v.icon}
              </div>
              <h3 className="font-semibold mt-3">{v.title}</h3>
              <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { target: 500, suffix: '+', label: 'Hotels listed' },
            { target: 50000, suffix: '+', label: 'Happy customers' },
            { target: 20, suffix: '+', label: 'Cities covered' },
            { target: 5, suffix: '+', label: 'Years of experience' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl md:text-5xl font-bold">
                <Counter target={s.target} suffix={s.suffix} />
              </p>
              <p className="text-white/80 mt-2 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold">What we offer</h2>
          <p className="text-text-2 dark:text-dark-text-2 mt-2">Everything you need for a seamless trip.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {OFFERINGS.map((o) => (
            <div key={o.title} className="p-6 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:shadow-card hover:-translate-y-0.5 transition">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 text-xl">
                {o.icon}
              </div>
              <h3 className="font-semibold mt-4">{o.title}</h3>
              <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-surface-2 dark:bg-dark-surface-2 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Meet the team</h2>
            <p className="text-text-2 dark:text-dark-text-2 mt-2">The people behind your journeys.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center p-6 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
                <Avatar name={m.name} size="xl" className="mx-auto" />
                <h3 className="font-semibold mt-4">{m.name}</h3>
                <p className="text-sm text-primary-600">{m.role}</p>
                <p className="text-xs text-text-2 dark:text-dark-text-2 mt-2">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold">What travelers say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border">
              <Rating value={t.rating} />
              <p className="text-sm text-text-2 dark:text-dark-text-2 mt-3 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-4">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-text-3">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-surface-2 dark:bg-dark-surface-2 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Get in touch</h2>
            <p className="text-text-2 dark:text-dark-text-2 mt-2">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>
            <div className="mt-8 space-y-4 text-sm">
              <p className="flex items-center gap-3"><LuMapPin className="h-5 w-5 text-primary-600" /> Thamel, Kathmandu, Nepal</p>
              <p className="flex items-center gap-3"><LuMail className="h-5 w-5 text-primary-600" /> hello@yatra.com.np</p>
              <p className="flex items-center gap-3"><LuPhone className="h-5 w-5 text-primary-600" /> +977 1 4000000</p>
              <p className="flex items-center gap-3"><LuUsers className="h-5 w-5 text-primary-600" /> Mon–Fri, 9am–6pm NPT</p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onContact)}
            className="p-6 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border space-y-4"
          >
            <Input label="Your name" {...register('name', { required: true })} />
            <Input label="Email" type="email" {...register('email', { required: true })} />
            <Textarea label="Message" rows={4} {...register('message', { required: true })} />
            <Button type="submit" fullWidth size="lg">Send message</Button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className={cn('rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-10 md:p-14 text-center relative overflow-hidden')}>
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 bg-accent-500/30 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to start your journey?</h2>
            <p className="text-white/85 mt-3 max-w-xl mx-auto">Find the perfect stay and plan your next Nepal adventure today.</p>
            <Button asChild size="xl" variant="accent" className="mt-7">
              <Link to={ROUTES.HOTELS}>
                Explore hotels <LuArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
