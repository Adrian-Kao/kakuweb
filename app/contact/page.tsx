import type { Metadata } from "next";
import ContactRoute from "../../components/contact/ContactRoute";

export const metadata: Metadata = {
  title: "Contact | KAKU Photography",
  description: "Contact KAKU Photography.",
};

export default function ContactPage() {
  return <ContactRoute />;
}
