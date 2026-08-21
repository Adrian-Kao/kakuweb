"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import MobileShell from "../mobile/MobileShell";

// Frontend typography/color settings: mobile About text, accent links, and background classes are in className strings below.
type MailStatus = "idle" | "sending" | "sent" | "error";

export default function MobileAbout() {
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
    <MobileShell>
      <div className="relative min-h-screen bg-[#050505] px-6 py-8 text-[#f3eee6]">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#c9a46a]">
            KAKU PHOTOGRAPHY
          </p>
          <h1 className="mt-5 text-5xl font-light uppercase tracking-[0.08em]">
            About
          </h1>

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

          <div className="mt-10 flex items-center gap-5 border-t border-white/10 pt-8">
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
          {isMailOpen ? (
            <form
              onSubmit={handleMailSubmit}
              className="mt-8 border-l border-[#c9a46a]/50 bg-[#050505]/70 px-5 py-5"
            >
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#c9a46a]">
                Contact Mail
              </p>
              <input
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
                disabled={mailStatus === "sending"}
                className="mt-5 border-b border-[#c9a46a] pb-2 text-xs uppercase tracking-[0.24em] text-[#c9a46a]"
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
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
}

