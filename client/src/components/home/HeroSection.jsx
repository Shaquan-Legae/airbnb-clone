import { Link } from 'react-router-dom';
import { homeImages } from '../../assets/assets';

export default function HeroSection() {
  return (
    <section className="relative min-h-140 overflow-hidden bg-neutral-950 mb-10 rounded-4xl">
      <img
        src={homeImages.hero}
        alt="A bright vacation home with a pool and mountain view"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/25 to-transparent" />
      <div className="relative mx-auto flex min-h-140 max-w-7xl items-center px-5 pb-20 pt-16 lg:px-8">
        <div className="max-w-2xl text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Vacation homes and experiences</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Find your next stay</h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">
            Browse city apartments, quiet cabins, and coastal lofts with clear prices, helpful details, and fast reservations.
          </p>
          <Link
            to="/listings"
            className="mt-8 inline-flex rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-rose-700"
          >
            Explore stays
          </Link>
        </div>
      </div>
    </section>
  );
}
