"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import MobileShell from "../mobile/MobileShell";

const P5Sketch = dynamic(() => import("../P5Sketch"), {
  ssr: false,
});

const mobileAboutSections = [
  {
    id: "philosophy",
    label: "01 \u2014 PHILOSOPHY",
    title: "Photographs are made in the quiet before certainty.",
    body: "My work begins with patience: letting a subject settle into the room, letting the available light become part of the portrait, and waiting for the small gestures that carry the truth of a person.",
  },
  {
    id: "process",
    label: "02 \u2014 PROCESS",
    title: "A slow conversation between light, body, and space.",
    body: "I build each session around restraint. Direction is minimal, movement is observed, and the frame is shaped by the emotional distance between the person and the surrounding shadow.",
  },
  {
    id: "experience",
    label: "03 \u2014 EXPERIENCE",
    title: "Portraits, editorials, and studies of atmosphere.",
    body: "Across commissioned work and personal projects, I focus on images that feel tactile and lived in: low light, muted contrast, and moments that remain after the camera is lowered.",
  },
  {
    id: "contact-section",
    label: "04 \u2014 Contact",
    title: "For portraits, visual stories, and quiet collaborations.",
    body: "I work with artists, individuals, and small teams seeking images with a slower rhythm. Every project starts with a conversation about presence, intention, and light.",
  },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function MobileAbout() {
  const [mailSender, setMailSender] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const mailInputRef = useRef<HTMLInputElement>(null);

  const handleMailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("Portfolio Inquiry");
    const body = encodeURIComponent(
      `From: ${mailSender || "Not provided"}\n\n${mailMessage}`,
    );
    window.location.href = `mailto:ledtw1991@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <P5Sketch intensity="low" />

        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
            KAKU PHOTOGRAPHY
          </p>
          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            About Me
          </h1>
          <p className="mt-7 text-sm leading-7 text-[rgba(243,238,230,0.62)]">
            A quiet portrait of process, presence, and the person behind the
            light.
          </p>

          <nav className="scrollbar-hidden sticky top-0 z-20 -mx-6 mt-10 flex gap-3 overflow-x-auto border-y border-white/10 bg-[#050505]/88 px-6 py-4 backdrop-blur-md">
            {mobileAboutSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="shrink-0 text-[0.68rem] uppercase tracking-[0.22em] text-[rgba(243,238,230,0.58)] transition hover:text-[#c9a46a]"
              >
                {section.label}
              </button>
            ))}
          </nav>

          <section className="mt-10">
            <p className="text-xs uppercase tracking-[0.36em] text-[#c9a46a]">
              Behind the Lens
            </p>
            <h2 className="mt-6 text-4xl font-light leading-tight">
              The person behind the light.
            </h2>
            <p className="mt-7 text-sm leading-7 text-[rgba(243,238,230,0.66)]">
              I photograph people through the atmosphere around them: the pause
              before they answer, the way light catches the edge of a face, and
              the shadows that make a portrait feel remembered.
            </p>
          </section>

          <div className="mt-10 overflow-hidden border border-white/10">
            <Image
              src="/about-portrait.png"
              alt="Photographer portrait"
              width={900}
              height={600}
              className="h-auto w-full grayscale brightness-50 contrast-125"
              priority
            />
          </div>

          <div className="mt-12 space-y-12">
            {mobileAboutSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-t border-white/10 pt-8"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[#c9a46a]">
                  {section.label}
                </p>
                <h3 className="mt-5 text-2xl font-light leading-8">
                  {section.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-[rgba(243,238,230,0.64)]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <form
            onSubmit={handleMailSubmit}
            className="mt-12 border-t border-white/10 pt-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9a46a]">
              Mail
            </p>
            <input
              ref={mailInputRef}
              type="email"
              value={mailSender}
              onChange={(event) => setMailSender(event.target.value)}
              placeholder="your@email.com"
              className="mt-5 w-full border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm text-[#f3eee6] outline-none placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
            />
            <textarea
              value={mailMessage}
              onChange={(event) => setMailMessage(event.target.value)}
              placeholder="Write a short message..."
              className="mt-3 h-36 w-full resize-none border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm leading-6 text-[#f3eee6] outline-none placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
            />
            <button
              type="submit"
              className="mt-5 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.24em] text-[#c9a46a]"
            >
              Send Email
            </button>
          </form>

          <div className="mt-10 flex items-center gap-5 border-t border-white/10 pt-8">

            <a
              aria-label="Open Instagram"
              href="https://www.instagram.com/kaku_foto?igsh=MWh5dzRzZm90cXRscw=="
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
            >
              <Image
                src="/instagram.svg"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain invert"
              />
            </a>
            <a
              aria-label="Open Threads"
              href="https://www.threads.com/@kaku_foto"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
            >
              <Image
                src="/thread.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain invert"
              />
            </a>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
