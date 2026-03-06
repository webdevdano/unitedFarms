import Link from "next/link";

export const metadata = {
  title: "About | United Farms of America",
  description: "Learn about United Farms of America — our mission, values, and the community behind the platform.",
};

const values = [
  {
    icon: "🌱",
    title: "Support Local Agriculture",
    body: "We believe in strengthening local food systems by connecting communities directly with the farmers who feed them.",
  },
  {
    icon: "🤝",
    title: "Community First",
    body: "UFA is built by and for the community. Anyone can list a farm, find fresh produce, and contribute to a more resilient food network.",
  },
  {
    icon: "🗺️",
    title: "Transparency & Discovery",
    body: "Every farm on our map is real, geolocated, and community-verified — making it simple to find what's grown near you.",
  },
  {
    icon: "♻️",
    title: "Sustainable Practices",
    body: "We highlight farms committed to organic, regenerative, and sustainable farming methods that protect the land for future generations.",
  },
];

const team = [
  {
    name: "Hector S.",
    role: "Founder & Developer",
    bio: "Built UFA to bridge the gap between consumers and local farmers using modern web technology.",
    avatar: "🧑‍💻",
  },
];

const stats = [
  { value: "20+", label: "Farms Listed" },
  { value: "15+", label: "States Covered" },
  { value: "100%", label: "Free to Use" },
  { value: "Open", label: "Source & Community" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-amber-50 to-blue-100 font-sans">

      {/* ── Hero ── */}
      <section className="relative py-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/60 to-amber-100/40 pointer-events-none" />
        <span className="relative text-6xl mb-4 select-none">🌾</span>
        <h1 className="relative text-5xl font-extrabold text-green-900 tracking-tight mb-4">
          United Farms of America
        </h1>
        <p className="relative max-w-2xl text-lg text-green-800/80 leading-relaxed">
          A community-powered directory connecting people with local farms across the country —
          from family-run CSAs to regenerative ranches.
        </p>
        <Link
          href="/"
          className="relative mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-full font-semibold shadow hover:bg-green-600 transition-colors duration-200"
        >
          Find Farms Near You →
        </Link>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-10 border border-green-100">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            United Farms of America exists to make local food accessible to everyone. We believe the
            distance between a consumer and the source of their food should be measured in miles, not
            supply-chain tiers. By providing a free, open, and community-maintained map of farms across
            the US, we help families discover fresh produce, support independent farmers, and build
            stronger regional food networks.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mt-4">
            Whether you&apos;re looking for a pick-your-own berry farm, a grass-fed beef ranch, or a
            neighborhood CSA, UFA puts it all on the map.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <li
              key={label}
              className="bg-white/70 backdrop-blur-sm border border-green-100 rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <span className="text-4xl font-extrabold text-green-700">{value}</span>
              <span className="text-sm text-gray-600 mt-1 font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Values ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map(({ icon, title, body }) => (
            <div
              key={title}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-green-100 shadow p-6 flex gap-4 items-start"
            >
              <span className="text-3xl select-none mt-0.5">{icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">The Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map(({ name, role, bio, avatar }) => (
            <div
              key={name}
              className="bg-white/70 backdrop-blur-sm border border-green-100 rounded-2xl shadow p-8 flex flex-col items-center text-center max-w-xs"
            >
              <span className="text-5xl mb-3 select-none">{avatar}</span>
              <h3 className="text-xl font-bold text-green-900">{name}</h3>
              <span className="text-sm font-medium text-green-600 mb-3">{role}</span>
              <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-3">Know a Farm We&apos;re Missing?</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          UFA grows with every submission. If there&apos;s a farm in your area not yet on our map, add it
          in seconds — no account required.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-green-700 text-white rounded-full font-semibold shadow hover:bg-green-600 transition-colors duration-200"
        >
          Add a Farm →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-green-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} United Farms of America · Built with ❤️ for local food
      </footer>
    </div>
  );
}
