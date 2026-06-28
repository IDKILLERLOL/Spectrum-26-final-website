'use client'

const featuredEvents = [
  {
    id: '1',
    name: 'Code Sprint 2026',
    category: 'TECH',
    description: '4-hour competitive programming challenge',
    price: 0,
    prizePool: '₹50,000'
  },
  {
    id: '2',
    name: 'AI Innovation Hack',
    category: 'TECH',
    description: 'Build AI-powered applications in 8 hours',
    price: 0,
    prizePool: '₹75,000'
  },
  {
    id: '3',
    name: 'Cultural Showcase',
    category: 'NON_TECH',
    description: 'Performance and cultural presentation competition',
    price: 0,
    prizePool: '₹30,000'
  },
  {
    id: '4',
    name: 'Web Design Challenge',
    category: 'TECH',
    description: 'Design the next big thing on the web',
    price: 0,
    prizePool: '₹40,000'
  }
]

export function FeaturedEvents() {
  return (
    <section id="events" className="bg-black py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-4 text-white">
          Featured Events
        </h2>
        <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
          Choose from tech competitions, hackathons, and cultural events. Whether you're a developer,
          designer, or performer, there's something for everyone.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                  {event.category === 'TECH' ? 'Technology' : 'Culture'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                {event.name}
              </h3>
              
              <p className="text-sm text-white/50 mb-4 line-clamp-2">
                {event.description}
              </p>
              
              {event.prizePool && (
                <div className="text-sm font-semibold text-white/70 mb-3">
                  Prize Pool: <span className="text-white">{event.prizePool}</span>
                </div>
              )}
              
              <button className="w-full bg-white/10 border border-white/20 text-white rounded py-2 px-3 text-sm font-medium hover:bg-white hover:text-black transition-colors">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
