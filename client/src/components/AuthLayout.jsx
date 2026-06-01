import { Link } from "react-router-dom";

export default function AuthLayout({ headline, subtitle, children }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-zinc-900 border-r border-zinc-800">
        <div>
          <Link
          to="/events"
          className="text-orange-400 font-mono text-sm tracking-[0.3em] uppercase hover:text-orange-300 transition-colors"
        >
          Alphavents
        </Link>
        </div>
        <div>
          <h1 className="text-6xl font-serif text-zinc-100 leading-tight mb-6">{headline}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{subtitle}</p>
        </div>
        <div className="text-zinc-600 font-mono text-xs">© {new Date().getFullYear()} — TFG</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">{children}</div>
    </div>
  );
}
