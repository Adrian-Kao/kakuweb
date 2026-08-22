"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import PortfolioNavigation from "../PortfolioNavigation";



// Frontend typography/color settings: this page's darkroom palette, text sizes, and font weights are controlled by Tailwind classes below.
type MailStatus = "idle" | "sending" | "sent" | "error";

export default function AboutMePage() {
  const [isFocused, setIsFocused] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [mailSender, setMailSender] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [mailStatus, setMailStatus] = useState<MailStatus>("idle");
  const [mailStatusMessage, setMailStatusMessage] = useState("");

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
      setMailStatusMessage(result?.message ?? "Message could not be sent.");
      return;
    }

    setMailStatus("sent");
    setMailStatusMessage("Message sent. Thank you.");
    setMailSender("");
    setMailMessage("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f3eee6]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/about-portrait.png')] bg-cover bg-[center_right_18%] opacity-45 transition-[filter,opacity] duration-[900ms] ease-out"
          style={{
            filter: isFocused
              ? "grayscale(1) brightness(0.55) contrast(1.18)"
              : "grayscale(1) brightness(0.43) contrast(1.12)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.72)_34%,rgba(5,5,5,0.34)_72%,rgba(5,5,5,0.2)_100%)]" />
        <div
          className={[
            "absolute right-[16%] top-[28%] h-64 w-64 rounded-full bg-[rgba(243,238,230,0.08)] blur-3xl transition-opacity duration-[900ms]",
            isFocused ? "opacity-100" : "opacity-35",
          ].join(" ")}
        />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.38)_0_1px,transparent_1px)] [background-size:10px_10px]" />
      </div>

      <main className="relative z-10 grid min-h-screen grid-cols-1 gap-12 px-7 py-8 sm:px-12 lg:grid-cols-[22%_78%] lg:px-20 lg:py-12">
        <aside className="flex min-h-[34vh] flex-col justify-between lg:min-h-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-[#c9a46a]">
              野次馬工作室
            </p>
            <p className="mt-14 text-5xl font-light uppercase leading-none tracking-[0.08em] text-[#f3eee6] sm:text-6xl">
              About
            </p>
          <form
            onSubmit={handleMailSubmit}
            className={[
              "mt-16 max-w-[22rem] border-l border-[#c9a46a]/50 bg-[#050505]/70 px-6 py-5 backdrop-blur-md transition duration-500 ease-out",
              isMailOpen ? "opacity-100" : "pointer-events-none opacity-0",
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
                X
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
            </button>
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
          </div>

          <div>
            
            <PortfolioNavigation className="mt-10" />
          </div>
        </aside>

        <section
          className="relative min-h-[72vh] overflow-hidden lg:min-h-0"
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <div className="relative z-10 flex min-h-full items-center px-8 py-14 sm:px-12 lg:px-16">
            <div className="max-w-[34rem]">
              
              <p className="mt-8 text-base leading-8 text-[rgba(243,238,230,0.68)]">
                I photograph people through the atmosphere around them: the pause
                before they answer, the way light catches the edge of a face, and
                the shadows that make a portrait feel remembered.
              </p>
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
        </section>
      </main>
    </div>
  );
}


