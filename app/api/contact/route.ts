import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { message: "Resend API key is not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    sender?: string;
    message?: string;
  } | null;

  const sender = body?.sender?.trim() ?? "";
  const message = body?.message?.trim() ?? "";

  if (!sender || !isValidEmail(sender)) {
    return NextResponse.json(
      { message: "Please provide a valid sender email." },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { message: "Please write a message before sending." },
      { status: 400 },
    );
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "bryant9662002@gmail.com";
  const from =
    process.env.RESEND_FROM_EMAIL ?? "KAKU Photography <onboarding@resend.dev>";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: sender,
    subject: "Portfolio Inquiry",
    text: `From: ${sender}\n\n${message}`,
  });

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "Email could not be sent." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
