
export default function Home() {
  return (
  <div className="min-h-screen bg-linear-to-b from-green-100 via-amber-50 to-blue-100 font-sans">
      <header className="w-full bg-green-300 text-white py-4 shadow">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">United Farms of America</h1>
          <nav>
            <ul className="flex gap-6 text-lg">
              <li><a href="#" className="hover:text-amber-200">Home</a></li>
              <li><a href="#" className="hover:text-amber-200">About</a></li>
              <li><a href="#" className="hover:text-amber-200">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center py-16 px-4">
        <section className="w-full max-w-xl bg-white/80 rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">Find Local Farms Near You</h2>
          <p className="mb-6 text-amber-900 text-center">Enter your city or zip code to discover nearby farms and fresh produce.</p>
          <form className="flex w-full max-w-md mx-auto mb-8">
            <input
              type="text"
              placeholder="Search by city or zip code..."
              className="flex-1 px-4 py-2 border text-green-400 border-green-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
            >
              Search
            </button>
          </form>
          <div className="w-full">
            {/* Results will be displayed here */}
            <div className="bg-white shadow rounded p-6 text-center text-gray-500">
              No farms found. Please search to see results.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
