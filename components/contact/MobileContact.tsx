"use client";

import MobileShell from "../mobile/MobileShell";
import ContactForm from "./ContactForm";

export default function MobileContact() {
  return (
    <MobileShell>
      <main className="min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
          Contact
        </h1>


        <ContactForm className="mt-10 px-5" />
      </main>
    </MobileShell>
  );
}
