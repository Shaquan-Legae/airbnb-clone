import { homeImages } from '../../assets/assets';

const experiences = [
    'Cooking class with a local host',
    'Guided architecture walk',
    'Sunset photography session',
];

export default function ExperiencesSection() {
    return (
        <section className="mt-15 bg-neutral-950 py-16 text-white rounded-2xl">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-8">
                <div>
                    <h2 className="text-3xl font-bold">Airbnb Experiences</h2>
                    <p className="mt-4 text-white/75">
                        Add a memorable activity to your trip, from neighborhood tours to meals hosted by locals.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {experiences.map((experience) => (
                            <span key={experience} className="rounded-full border border-white/25 px-4 py-2 text-sm">
                                {experience}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <img
                        src={homeImages.dinnerExperience}
                        alt="Guests sharing dinner with a local host"
                        className="h-72 w-full rounded-lg object-cover"
                    />
                    <img
                        src={homeImages.outdoorExperience}
                        alt="Travelers hiking through a scenic landscape"
                        className="h-72 w-full rounded-lg object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
