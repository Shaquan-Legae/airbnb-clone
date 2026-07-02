import { inspirationCards } from '../../assets/assets';

export default function InspirationCards() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-950">Inspiration for your next trip</h2>
          <p className="mt-2 text-neutral-600">Popular locations with homes ready for longer weekends and work trips.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {inspirationCards.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <h3 className="font-semibold text-neutral-950">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
