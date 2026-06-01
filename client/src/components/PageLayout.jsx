import Navbar from "./Navbar";

export default function PageLayout({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className={`${maxWidth} mx-auto px-6 py-12`}>
        {children}
      </main>
    </div>
  );
}
