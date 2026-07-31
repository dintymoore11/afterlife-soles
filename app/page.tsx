import Link from "next/link";
import { LaunchButton } from "./components/LaunchButton";

const steps = [
  ["01", "Prepare", "Expose clean, sound rubber around the worn toe."],
  ["02", "Glue", "Apply a thin, even layer of the recommended adhesive."],
  ["03", "Clamp", "Seat the cap and wrap it tight for uniform pressure."],
  ["04", "Cure", "Give the repair a full cure before the next session."],
];
const faqs = [
  ["Will these fit my shoes?", "AfterLife Soles are designed to conform to a wide range of neutral and aggressive climbing shoes. Final sizing guidance is coming with launch."],
  ["What glue should I use?", "Use a flexible contact adhesive made for footwear and rubber. Our launch guide will include tested recommendations."],
  ["How long does installation take?", "Plan for about 30–45 minutes of hands-on work, plus the adhesive’s full cure time."],
  ["Can I repair aggressive shoes?", "Yes. Careful heating and wrapping help the cap follow a downturned shape without flattening it."],
  ["How long do repairs last?", "Longevity depends on footwork, rock type, and installation. The replaceable cap is built to take the abuse your rand would otherwise absorb."],
];

export default function Home() {
  return <main>
    <section className="hero section-shell">
      <div className="hero-copy"><span className="eyebrow">THE SECOND SEND STARTS HERE</span><h1>Renew your<br /><em>climbing shoes.</em></h1><p>Don’t throw away your favorite climbing shoes because of worn-out toes. AfterLife Soles gives them a second life.</p><LaunchButton /></div>
      <div className="hero-visual" aria-label="Stylized climbing shoe toe cap"><div className="topo t1"/><div className="topo t2"/><div className="shoe"><span className="shoe-stitch"/><strong>ALS</strong></div><div className="hero-note"><b>01</b><span>FIELD-TESTED<br />TOE PROTECTION</span></div></div>
      <div className="scroll-note">SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <section className="manifesto section-shell"><span className="side-label">WHY REPAIR</span><div><p className="big-copy">Your best shoes are the ones that already know your feet. <em>Keep them on the wall.</em></p><div className="benefit-grid">{[["2×", "More life from a pair"],["$", "Keep cash for road trips"],["↓", "Less rubber in landfills"],["∞", "Preserve the perfect fit"]].map(([n,t])=><div key={t}><strong>{n}</strong><span>{t}</span></div>)}</div></div></section>

    <section className="process section-shell"><div className="section-heading"><span className="eyebrow">THE PROCESS</span><h2>Four steps.<br />One more season.</h2><Link href="/instructions" className="text-link">Full instructions <span>→</span></Link></div><div className="steps">{steps.map(([n,t,d])=><article key={n}><span className="step-number">{n}</span><div className={`step-icon step-${n}`}><i/><i/><i/></div><h3>{t}</h3><p>{d}</p></article>)}</div></section>

    <section className="before section-shell"><div className="section-heading"><span className="eyebrow">PROOF OF LIFE</span><h2>Same shoe.<br />Second chance.</h2></div><div className="comparison"><div className="photo-placeholder before-photo"><span>BEFORE</span><div className="rock-shoe worn"/></div><div className="photo-placeholder after-photo"><span>AFTER</span><div className="rock-shoe repaired"/></div></div><p className="caption">FIELD TEST 001 — SHOE IMAGERY PLACEHOLDER / REPLACE WITH YOUR OWN SEND</p></section>

    <section className="basecamp-callout"><div className="section-shell"><span className="eyebrow">BASE CAMP</span><h2>Beta is better<br />when it’s shared.</h2><p>Ask questions, trade repair tips, and show us where your shoes get their next life.</p><Link href="/base-camp" className="button primary">Join the discussion <span>→</span></Link></div></section>

    <section className="faq section-shell"><div className="section-heading"><span className="eyebrow">FIELD NOTES</span><h2>Frequently<br />asked questions.</h2></div><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
  </main>;
}
