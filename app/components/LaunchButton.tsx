"use client";
import { useState } from "react";

export function LaunchButton() {
  const [open, setOpen] = useState(false);
  return <>
    <button className="button primary" onClick={() => setOpen(true)}>Launching soon <span>↗</span></button>
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="launch-title" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">×</button><span className="eyebrow">FIRST ASCENT IN PROGRESS</span><h2 id="launch-title">The next life of your shoes is almost here.</h2><p>We’re finishing field tests and dialing in the kit. Check back soon for launch updates and early access.</p><LinkButton /></div></div>}
  </>;
}

function LinkButton(){ return <a className="text-link" href="/contact">Stay in the loop <span>→</span></a> }
