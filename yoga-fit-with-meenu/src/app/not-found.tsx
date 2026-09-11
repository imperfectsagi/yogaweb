import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section text-center">
      <div className="container-narrow">
        <h1 className="text-4xl font-semibold mb-4">Page not found</h1>
        <p className="text-muted mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
