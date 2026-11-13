import Image from "next/image";
import "./instructions.css";

const sections = [
  { number: "01", title: "Sand both surfaces", body: "Sand the shoe and toe cap surfaces until they appear dull.", image: "/images/instructions/sanding.jpg", alt: "Sanding the rubber surface of a climbing shoe until it appears dull" },
  { number: "02", title: "Clean and promote adhesion", body: "Thoroughly wipe both surfaces with an adhesion promoter wipe, paying special attention to the edges.", image: "/images/instructions/priming.jpg", alt: "Wiping a climbing shoe surface with adhesion promoter" },
  { number: "03", title: "Dry fit and trace", body: "Dry fit the toe cap and trace its edge onto the shoe with a pen. Toe caps may be trimmed with scissors if needed." },
  { number: "04", title: "Apply the adhesive", body: "Apply and spread an even coat of adhesive onto both surfaces, all the way to the edges. Glue only one shoe at a time because the adhesive cures quickly.", image: "/images/instructions/applying-adhesive.jpg", alt: "Applying an even coat of adhesive to a climbing shoe toe cap" },
  { number: "05", title: "Place and press", body: "Place the toe cap on the shoe and press firmly over the entire surface. Apply heavy, sharp pressure to remove air pockets and pay special attention to every edge. The surfaces may be tapped together with a hammer to help ensure strong adhesion." },
  { number: "06", title: "Stuff and mummy wrap", body: "Firmly stuff the shoe with socks or paper to maintain its shape, then wrap the toe cap tightly with wrapping tape. Begin from toe to heel so the cap cannot slip forward, then cover multiple angles and critical edges.", image: "/images/instructions/mummy-wrap.jpg", alt: "A climbing shoe tightly wrapped in tape while the toe cap cures" },
  { number: "07", title: "Allow a full cure", body: "Allow 24–48 hours of cure time before removing the mummy wrap and bringing your climbing shoes back to life." },
  { number: "08", title: "Inspect before climbing", body: "Inspect the entire perimeter of each toe cap. Do not use the shoes if any edge is loose or if the toe cap peels away by hand." },
];

export default function Instructions() {
  return (
    <main>
      <section className="page-hero section-shell">
        <span className="eyebrow">INSTALLATION GUIDE</span>
        <h1>Good prep.<br /><em>Strong repair.</em></h1>
        <p>Work on one shoe at a time. Clean surfaces, complete edge coverage, firm pressure, and a full cure are what make the repair last.</p>
      </section>

      <div className="instructions-layout section-shell">
        <aside>
          <strong>FIELD CHECK</strong>
          <p>Work in a well-ventilated area. Follow all adhesive and adhesion-promoter safety directions. Wear appropriate hand and eye protection.</p>
          <nav>
            {sections.map(({ number, title }) => <a key={number} href={`#step-${number}`}>{number} — {title}</a>)}
          </nav>
        </aside>

        <div className="instruction-list">
          {sections.map(({ number, title, body, image, alt }) => (
            <section id={`step-${number}`} key={number} className={image ? "has-media" : undefined}>
              <span>{number}</span>
              <div className="instruction-copy"><h2>{title}</h2><p>{body}</p></div>
              {image && alt ? <figure><Image unoptimized src={image} alt={alt} width={1600} height={1200} /></figure> : null}
            </section>
          ))}
          <section className="replacement-note">
            <span>REUSE</span>
            <div><h2>Replacing a worn cap</h2><p>Toe caps can be removed and replaced by reheating the adhesive with a hair dryer—or carefully with a heat gun—to soften the bond before peeling the cap away. Use acetone to remove remaining adhesive, then repeat the sanding and installation process for the next pair of AfterLife Soles.</p></div>
          </section>
        </div>
      </div>
    </main>
  );
}
