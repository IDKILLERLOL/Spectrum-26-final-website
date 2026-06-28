'use client'

export function SpectrumStats() {
  const stats = [
    { label: 'Events', value: '20+' },
    { label: 'Participants', value: '500+' },
    { label: 'Prize Pool', value: '₹500K' },
    { label: 'Days', value: '3' }
  ]

  return (
    <section className="bg-black py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-16 text-white">
          Spectrum 26 by the Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="border border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/50 text-sm font-medium uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
