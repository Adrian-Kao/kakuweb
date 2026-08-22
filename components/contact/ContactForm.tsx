"use client";

import { useState, type FormEvent } from "react";

type MailStatus = "idle" | "sending" | "sent" | "error";

type ContactFormProps = {
  className?: string;
};

export default function ContactForm({ className = "" }: ContactFormProps) {
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<MailStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender, message }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      setStatus("error");
      setStatusMessage(result?.message ?? "Message could not be sent.");
      return;
    }

    setStatus("sent");
    setStatusMessage("Message sent. Thank you.");
    setSender("");
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "border-l border-[#c9a46a]/50 bg-[#050505]/70 px-6 py-6 backdrop-blur-md",
        className,
      ].join(" ")}
    >
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#c9a46a]">
        Contact Mail
      </p>

      <label
        htmlFor="contact-mail-sender"
        className="mt-6 block text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
      >
        Sender
      </label>
      <input
        id="contact-mail-sender"
        type="email"
        required
        value={sender}
        onChange={(event) => setSender(event.target.value)}
        placeholder="your@email.com"
        className="mt-2 w-full border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm text-[#f3eee6] outline-none transition placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
      />

      <label
        htmlFor="contact-mail-message"
        className="mt-5 block text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(243,238,230,0.62)]"
      >
        Message
      </label>
      <textarea
        id="contact-mail-message"
        required
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="..."
        className="mt-2 h-44 w-full resize-none border border-white/10 bg-[#050505]/65 px-4 py-3 text-sm leading-6 text-[#f3eee6] outline-none transition placeholder:text-[rgba(243,238,230,0.36)] focus:border-[#c9a46a]/70"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 border-b border-[#c9a46a] pb-2 text-[0.68rem] uppercase tracking-[0.24em] text-[#c9a46a] transition hover:text-[#f3eee6] disabled:cursor-wait disabled:opacity-50"
      >
        {status === "sending" ? "寄送中..." : "信件已傳送"}
      </button>

      {statusMessage ? (
        <p
          className={[
            "mt-4 text-xs leading-5",
            status === "error"
              ? "text-red-300"
              : "text-[rgba(243,238,230,0.62)]",
          ].join(" ")}
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
