"use client";
import { useState } from "react";

// Sample farm data
const farmsData = [
  {
    id: 1,
    name: "Green Valley Farm",
    city: "Chico",
    zip: "95928",
    address: "123 Orchard Rd, Chico, CA",
    contact: "(530) 555-1234"
  },
  {
    id: 2,
    name: "Central Harvest",
    city: "Modesto",
    zip: "95350",
    address: "456 Farm Lane, Modesto, CA",
    contact: "(209) 555-5678"
  },
  {
    id: 3,
    name: "Sunrise Acres",
    city: "Davis",
    zip: "95616",
    address: "789 Sunrise Blvd, Davis, CA",
    contact: "(530) 555-9012"
  }
];

export default function Home() {
  // State for search input and filtered results
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(farmsData);

  // Handle search input change
  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle form submit to filter farms
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) {
      setResults(farmsData);
      return;
    }
    setResults(
      farmsData.filter(
        (farm) =>
          farm.city.toLowerCase().includes(query) ||
          farm.zip.includes(query)
      )
    );
  };

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
          {/* Search form */}
          <form className="flex w-full max-w-md mx-auto mb-8" onSubmit={handleSubmit}>
            <input
              type="text"
              value={search}
              onChange={handleChange}
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
          {/* Results list */}
          <div className="w-full">
            {results.length === 0 ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                No farms found. Please search to see results.
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map((farm) => (
                  <li key={farm.id} className="bg-green-50 border border-green-200 rounded p-4 shadow">
                    <h3 className="text-xl font-semibold text-green-700">{farm.name}</h3>
                    <p className="text-gray-700">{farm.address}</p>
                    <p className="text-gray-600">City: {farm.city} | Zip: {farm.zip}</p>
                    <p className="text-gray-600">Contact: {farm.contact}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
