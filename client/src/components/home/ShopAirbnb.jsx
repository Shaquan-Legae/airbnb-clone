import { homeImages } from '../../assets/assets';

export default function ShopAirbnb() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8">
      <img
        src={homeImages.shop}
        alt="A warm living room with carefully styled home products"
        className="h-[420px] w-full rounded-lg object-cover"
      />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">Shop Airbnb</p>
        <h2 className="mt-3 text-3xl font-bold text-neutral-950">Bring the feeling home</h2>
        <p className="mt-4 text-neutral-600">
          Explore bedding, lighting, and hosting essentials inspired by homes guests love.
        </p>
        <button type="button" className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800">
          Shop collection
        </button>
      </div>
    </section>
  );
}
