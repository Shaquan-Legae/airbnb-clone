import { Link, useParams } from "react-router-dom";

export default function PlacesPage() {
    const { action } = useParams();

    return (
        <div>

            {action !== 'new' && (
                <div className="text-center">
                    <Link
                        className="bg-primary text-white py-2 px-6 rounded-full inline-flex gap-2 mt-5"
                        to={'/account/places/new'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>

                        Add New Place
                    </Link>
                </div>
            )}

            {action === 'new' && (
                <div>
                    <form action="" className="">
                        <h2 className="text-xl mt-4">Title</h2>
                        <input type="text" placeholder="Title" />
                        <h2 className="text-xl mt-4">Address</h2>
                        <input type="text" placeholder="address" />
                        <h2 className="text-xl mt-4">Photos</h2>

                        <div className="flex gap-2">
                            <input type="text" placeholder="Photo URL" />
                            <button className="bg-gray-200 px-4 rounded-2xl" type="button">Add&nbsp;Photo</button>
                        </div>
                        <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols6">
                            <button className="border bg-transparent rounded-2xl p-8 text-xl text-gray-600 flex justify-center gap-1" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                </svg>

                                Upload
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}