"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import MobileShell from "../mobile/MobileShell";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

export default function MobileContact() {
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Portfolio Inquiry");
    const body = encodeURIComponent(
      `From: ${sender || "Not provided"}\n\n${message}`,
    );
    window.location.href = `mailto:ledtw1991@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <P5Sketch intensity="low" />

        <section className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
              KAKU PHOTOGRAPHY
            </p>
            <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
              Contact
            </h1>
            <p className="mt-7 text-2xl font-light leading-9">
              Let the next frame begin.
            </p>
          </div>

          <nav className="mb-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsMailOpen(true)}
              className="border-b border-white/10 py-4 text-left text-sm uppercase tracking-[0.24em] text-[#f3eee6]"
            >
              01 \u2014 GMAIL
            </button>
            <a
              href="https://www.instagram.com/kaku_foto?igsh=MWh5dzRzZm90cXRscw=="
              target="_blank"
              rel="noreferrer"
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
            >
              02 \u2014 INSTAGRAM
            </a>
            <a
              href="https://www.threads.com/@kaku_foto"
              target="_blank"
              rel="noreferrer"
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
            >
              03 \u2014 THREADS
            </a>
          </nav>
        </section>

        <div
          className={[
            "fixed inset-0 z-[80] bg-[#050505]/72 backdrop-blur-sm transition-opacity duration-300",
            isMailOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          onClick={() => setIsMailOpen(false)}
        />

        <form
          onSubmit={handleSubmit}
          className={[
            "fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#050505] px-6 pb-8 pt-6 text-[#f3eee6] shadow-[0_-30px_100px_rgba(0,0,0,0.64)] transition-transform duration-500 ease-out",
            isMailOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9a46a]">
              Gmail
            </p>
            <button
              type="button"
              aria-label="Close mail form"
              onClick={() => setIsMailOpen(false)}
              className="text-2xl font-light text-[rgba(243,238,230,0.68)]"
            >
              ×
            </button>
          </div>

          <input
            type="email"
            value={sender}
            onChange={(event) => setSender(event.target.value)}
            placeholder="your@email.com"
            className="mt-6 w-full border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm outline-none placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your message..."
            className="mt-3 h-36 w-full resize-none border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm leading-6 outline-none placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
          />
          <button
            type="submit"
            className="mt-5 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.24em] text-[#c9a46a]"
          >
            Send Email
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
