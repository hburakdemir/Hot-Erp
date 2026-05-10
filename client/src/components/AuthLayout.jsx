export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-navy-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-red-600/30" />
          <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-red-500/20" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-display text-red-700 text-xl font-bold">HU</span>
            </div>
            <div>
              <span className="font-display text-white text-xl tracking-wide block">HotoKontrol</span>
              <span className="text-white/70 text-xs">Hacettepe Üniversitesi</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="mb-8">
            <p className="font-display italic text-3xl text-white leading-snug mb-4">
              “Birlikte öğrenir, birlikte üretiriz.”
            </p>
            <footer className="text-white/60 text-sm">
              Öğrenci topluluğu iç yönetim paneli
            </footer>
          </blockquote>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Tek topluluk', value: '1' },
              { label: 'Üye kaydı', value: '50+' },
              { label: 'Komite', value: '6' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl text-white mb-1">{stat.value}</div>
                <div className="text-white/50 text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto bg-cream-100 dark:bg-navy-950 py-12 px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-navy-900 rounded-xl flex items-center justify-center">
              <span className="font-display text-white font-bold text-sm">HU</span>
            </div>
            <div>
              <span className="font-display text-zinc-900 dark:text-white text-lg block">HotoKontrol</span>
              <span className="text-xs text-zinc-500">Hacettepe Üniversitesi</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
