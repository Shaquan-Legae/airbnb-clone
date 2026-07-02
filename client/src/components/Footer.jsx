const footerGroups = [
    {
        title: 'Support',
        links: ['Help Center', 'AirCover', 'Anti-discrimination', 'Cancellation options'],
    },
    {
        title: 'Hosting',
        links: ['Airbnb your home', 'Host resources', 'Community forum', 'Hosting responsibly'],
    },
    {
        title: 'Airbnb',
        links: ['Newsroom', 'Careers', 'Investors', 'Gift cards'],
    },
    {
        title: 'Discover',
        links: ['Weekend breaks', 'Unique stays', 'Travel articles', 'Experiences'],
    },
];

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-neutral-200 -mb-20">
            <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {footerGroups.map((group) => (
                        <div key={group.title}>
                            <h2 className="text-sm font-semibold text-neutral-950">{group.title}</h2>
                            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                                {group.links.map((link) => (
                                    <li key={link}>
                                        <a href="/" className="hover:underline">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-2 flex flex-col gap-4 pt-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between -mb-5">
                    <p>© 2026 AirBnb. All rights reserved.</p>
                    <div className="flex flex-wrap gap-3">
                        <select className="rounded-full border border-neutral-300 bg-white px-2 py-2">
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                        </select>
                        <select className="rounded-full border border-neutral-300 bg-white px-3 py-2">
                            <option>ZAR</option>
                            <option>USD</option>
                            <option>EUR</option>
                        </select>
                    </div>
                </div>
            </div>
        </footer>
    );
}
