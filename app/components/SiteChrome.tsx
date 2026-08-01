"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [["/", "Home"], ["/instructions", "Instructions"], ["/base-camp", "Forum"], ["/contact", "Contact"]];

export function Mark() {
  return <span className="mark" aria-hidden="true"><i /><i /><i /></span>;
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="brand" href="/" onClick={() => setOpen(false)}><Mark /><span>AFTERLIFE<br />SOLES</span></Link>
    <button className="menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><span /><span /></button>
    <nav className={open ? "open" : ""} aria-label="Main navigation">
      {nav.map(([href, label]) => <Link key={href} href={href} className={path === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
  </header>;
}

export function Footer() {
  return <footer><div className="footer-brand"><Mark /><strong>BUILT TO KEEP<br />CLIMBING.</strong></div><div className="footer-links"><Link href="/instructions">Instructions</Link><Link href="/base-camp">Forum</Link><Link href="/contact">Contact</Link></div><p>© {new Date().getFullYear()} AfterLife Soles<br />Repair more. Replace less.</p></footer>;
}
