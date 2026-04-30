import type { JSX } from "react";
import { Link } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type NotFoundPageProps = {
  title: string;
  message: string;
};

export const NotFoundPage = ({ title, message }: NotFoundPageProps): JSX.Element => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <img
        src={`${import.meta.env.BASE_URL}offon_mascot_3_transparent.webp`}
        alt="The OffOn firefly mascot looking puzzled"
        width={120}
        height={120}
        loading="lazy"
        className="mb-6 w-24 opacity-80"
      />
      <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Link
        to="/"
        className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
      >
        Go to homepage
      </Link>
    </main>
    <Footer />
  </div>
);
