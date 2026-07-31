const sections = [
  ["01", "Preparing the shoe", "Remove laces and any loose rubber. Inspect the rand: this repair is intended for surface wear and small toe holes, not structural damage. Mark the area the cap will cover."],
  ["02", "Sanding", "Use medium-grit sandpaper to roughen both the shoe and the inside of the cap. Work evenly until both surfaces are matte, without thinning the shoe’s remaining rubber."],
  ["03", "Cleaning", "Brush away dust, then wipe both bonding surfaces with a lint-free cloth and the cleaner recommended by your adhesive manufacturer. Let them dry completely."],
  ["04", "Applying adhesive", "Apply a thin, continuous coat to both surfaces. Avoid puddles and bare spots. Follow the adhesive’s open-time guidance before joining the pieces."],
  ["05", "Heating (if applicable)", "If your cap needs shaping, warm it gently and evenly. It should become pliable, never hot enough to smoke, bubble, or damage the shoe."],
  ["06", "Installing the toe cap", "Align the center of the cap with the centerline of the toe. Roll it into place from the front toward the edges, pushing out trapped air as you go."],
  ["07", "Wrapping", "Use repair tape or a flexible wrap to hold the cap under firm, even pressure. Protect buckles and straps, and do not distort the shoe’s shape."],
  ["08", "Cure time", "Leave the repair undisturbed for the adhesive’s full cure time—typically 24 hours. Cool or humid conditions may require longer."],
  ["09", "Final trimming", "Remove the wrap and inspect every edge. Carefully trim excess material with a sharp blade, cutting away from your hands and the upper."],
];

export default function Instructions(){return <main><section className="page-hero section-shell"><span className="eyebrow">INSTALLATION GUIDE / V1.0</span><h1>Good prep.<br /><em>Great repair.</em></h1><p>Take your time. A clean surface, even pressure, and a full cure make the difference between a patch and a second life.</p></section><div className="instructions-layout section-shell"><aside><strong>FIELD CHECK</strong><p>Work in a ventilated area. Follow all adhesive safety directions and wear appropriate hand and eye protection.</p><nav>{sections.map(([n,t])=><a key={n} href={`#step-${n}`}>{n} — {t}</a>)}</nav></aside><div className="instruction-list">{sections.map(([n,t,d])=><section id={`step-${n}`} key={n}><div><span>{n}</span><h2>{t}</h2><p>{d}</p></div><div className="empty-image">Photo / video placeholder</div></section>)}</div></div></main>}
