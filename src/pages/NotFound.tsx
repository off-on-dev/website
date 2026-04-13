import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/data/constants";

const NotFound = (): JSX.Element => {

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Page Not Found - Offon</title>
        <meta name="description" content="The page you are looking for does not exist or has been moved." />
        <meta property="og:title" content="Page Not Found - Offon" />
        <meta property="og:description" content="The page you are looking for does not exist or has been moved." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:title" content="Page Not Found - Offon" />
        <meta name="twitter:description" content="The page you are looking for does not exist or has been moved." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Helmet>
      <Navbar />
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-4">404</span>
        <h1 className="text-4xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to home →
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
