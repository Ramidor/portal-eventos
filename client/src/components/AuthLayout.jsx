export default function AuthLayout({ headline, subtitle, children }) {
  return (
    <div className="min-h-screen bg-stone-950 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-stone-900 border-r border-stone-800">
        <div>
          <span className="text-amber-400 font-mono text-xs tracking-[0.3em] uppercase">Portal de Eventos</span>
        </div>
        <div>
          <h1 className="text-6xl font-serif text-stone-100 leading-tight mb-6">{headline}</h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">{subtitle}</p>
        </div>
        <div className="text-stone-600 font-mono text-xs">© {new Date().getFullYear()} — TFG</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">{children}</div>
    </div>
  );
}
