"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import PortfolioNavigation from "../PortfolioNavigation";



// Frontend typography/color settings: this page's darkroom palette, text sizes, and font weights are controlled by Tailwind classes below.
type AboutSectionId = "philosophy" | "process" | "experience";
type MailStatus = "idle" | "sending" | "sent" | "error";

const aboutSections: Array<{
  id: AboutSectionId;
  label: string;
  title: string;
  body: string;
}> = [
  {
  //about me 自界
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
];

export default function AboutMePage() {
  const [activeSection, setActiveSection] =
    useState<AboutSectionId>("philosophy");
  const [isFocused, setIsFocused] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [mailSender, setMailSender] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [mailStatus, setMailStatus] = useState<MailStatus>("idle");
  const [mailStatusMessage, setMailStatusMessage] = useState("");

  const section = useMemo(
    () =>
      aboutSections.find((item) => item.id === activeSection) ??
      aboutSections[0],
    [activeSection],
  );

  const handleMailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMailStatus("sending");
    setMailStatusMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: mailSender,
        message: mailMessage,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      setMailStatus("error");
      setMailStatusMessage(result?.message ?? "無法寄信，請稍後再試。");
      return;
    }

    setMailStatus("sent");
    setMailStatusMessage("成功寄送!");
    setMailSender("");
    setMailMessage("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <main className="relative z-10 grid min-h-screen grid-cols-1 gap-12 px-7 py-8 sm:px-12 lg:grid-cols-[24%_76%] lg:px-20 lg:py-12">
        <aside className="flex min-h-[34vh] flex-col justify-between lg:min-h-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              KAKU PHOTOGRAPHY
            </p>
            <p className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
              About Me
            </p>
            <p className="mt-8 max-w-xs text-base leading-7 text-[rgba(243,238,230,0.62)]">
              這邊可以放座右銘
            </p>

            <nav
              aria-label="About sections"
              className="mt-10 flex max-w-xs flex-col gap-2"
            >
              {aboutSections.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveSection(item.id)}
                    className={[
                      "border-b py-3 text-left text-xs uppercase tracking-[0.22em] transition duration-300",
                      "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]",
                      isActive
                        ? "border-[#c9a46a] text-[#c9a46a]"
                        : "border-white/10 text-[rgba(243,238,230,0.5)] hover:border-white/30 hover:text-[#f3eee6]",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            
            <PortfolioNavigation className="mt-10" />
          </div>
        </aside>

        <section
          className="relative min-h-[72vh] overflow-hidden border border-white/10 bg-[#050505] lg:min-h-0"
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-[url('/about-portrait.png')] bg-cover bg-[center_right_18%] opacity-45 transition-[filter,opacity] duration-[900ms] ease-out"
              style={{
                filter: isFocused
                  ? "grayscale(1) brightness(0.55) contrast(1.18)"
                  : "grayscale(1) brightness(0.43) contrast(1.12)",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.95)_0%,rgba(5,5,5,0.6)_48%,rgba(5,5,5,0.25)_100%)]" />
            <div
              className={[
                "absolute right-[16%] top-[28%] h-64 w-64 rounded-full bg-[rgba(243,238,230,0.08)] blur-3xl transition-opacity duration-[900ms]",
                isFocused ? "opacity-100" : "opacity-35",
              ].join(" ")}
            />
            <div className="absolute inset-0 opacity-[0.08] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.38)_0_1px,transparent_1px)] [background-size:10px_10px]" />
          </div>
 
          <div className="relative z-10 flex min-h-full items-center px-8 py-14 sm:px-12 lg:px-16">
            <div className="max-w-[34rem]">
              <p className="text-xs uppercase tracking-[0.36em] text-[#c9a46a]">
                Behind the Lens
              </p>
              <h1 className="mt-8 text-4xl font-light leading-tight tracking-normal text-[#f3eee6] sm:text-5xl">
                The person behind the light.
              </h1>
              <p className="mt-8 text-base leading-8 text-[rgba(243,238,230,0.68)]">
                I photograph people through the atmosphere around them: the pause
                before they answer, the way light catches the edge of a face, and
                the shadows that make a portrait feel remembered.
              </p>

              <div
                key={activeSection}
                className="mt-12 animate-[aboutCopyFade_420ms_ease-out]"
              >
                <div className="mb-6 h-px w-24 bg-[#c9a46a]/70" />
                <h2 className="text-xl font-light leading-8 text-[#f3eee6]">
                  {section.title}
                </h2>
                <p className="mt-5 text-sm leading-7 text-[rgba(243,238,230,0.64)]">
                  {section.body}
                </p>
              </div>

              <div className="mt-10 flex items-center gap-5">
                <button
                  type="button"
                  aria-label="Open email field"
                  aria-expanded={isMailOpen}
                  onClick={() => setIsMailOpen((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a46a]"
                >
                  <Image
                    src="/mail.png"
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain invert"
                  />
                </button>
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

          <form
            onSubmit={handleMailSubmit}
            className={[
              "absolute right-8 top-1/2 z-20 w-[min(22rem,calc(100%-4rem))] -translate-y-1/2 border-l border-[#c9a46a]/50 bg-[#050505]/70 px-6 py-5 backdrop-blur-md transition duration-500 ease-out sm:right-12 lg:right-16",
              isMailOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-8 opacity-0",
            ].join(" ")}
            aria-hidden={!isMailOpen}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#c9a46a]">
                Contact Mail
              </p>
              <button
                type="button"
                aria-label="Close email field"
                onClick={() => setIsMailOpen(false)}
                className="text-lg font-light leading-none text-[rgba(243,238,230,0.62)] transition hover:text-[#f3eee6]"
              >
                ×
              </button>
            </div>

            <label
              htmlFor="about-mail-sender"
              className="mt-5 block text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
            >
              Sender
            </label>
            <input
              id="about-mail-sender"
              type="email"
              value={mailSender}
              onChange={(event) => setMailSender(event.target.value)}
              placeholder="your@email.com"
              className="mt-2 w-full border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm text-[#f3eee6] outline-none transition placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
            />

            <label
              htmlFor="about-mail-message"
              className="mt-5 block text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
            >
              Message
            </label>
            <textarea
              id="about-mail-message"
              value={mailMessage}
              onChange={(event) => setMailMessage(event.target.value)}
              placeholder="Write a short message..."
              className="mt-2 h-36 w-full resize-none border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm leading-6 text-[#f3eee6] outline-none transition placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
            />
            <button
              type="submit"
              disabled={mailStatus === "sending"}
              className="mt-5 border-b border-[#c9a46a] pb-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a46a] transition hover:text-[#f3eee6]"
            >
              {mailStatus === "sending" ? "Sending..." : "Send Message"}
            </button >
            {mailStatusMessage ? (
              <p
                className={[
                  "mt-4 text-xs leading-5",
                  mailStatus === "error"
                    ? "text-red-300"
                    : "text-[rgba(243,238,230,0.62)]",
                ].join(" ")}
              >
                {mailStatusMessage}
              </p>
            ) : null}
          </form>
        </section>
      </main>
    </div>
  );
}
