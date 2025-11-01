"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

type Farm = {
  _id?: string;
  MarketName: string;
  Address: string;
  City: string;
  Zip: string;
  Phone?: string;
  FarmType?: string;
  Description?: string;
};

export default function Home() {
  const { data: session } = useSession();
  // State for search input, results, loading, and error
  const [search, setSearch] = useState<string>("");
  const [radius, setRadius] = useState<string>("30");
  const [results, setResults] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [userFarms, setUserFarms] = useState<Farm[]>([]);
  const [userFarmsLoading, setUserFarmsLoading] = useState<boolean>(true);

  // Fetch user-submitted farms on mount
  useEffect(() => {
    const fetchUserFarms = async () => {
      try {
        const res = await fetch("/api/user-farms");
        if (res.ok) {
          const data = await res.json();
          setUserFarms(data);
        }
      } catch {
        console.error("Failed to fetch user farms");
      } finally {
        setUserFarmsLoading(false);
      }
    };
    fetchUserFarms();
  }, []);

  // Handle search input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle radius input change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(e.target.value);
  };

  // Handle form submit to fetch farms from API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let url = "/api/farms";
      const input = search.trim();
      // If input is a 5-digit zip code, search by zip and user radius
      if (/^\d{5}$/.test(input)) {
        url += `?zip=${encodeURIComponent(input)}&radius=${encodeURIComponent(radius)}`;
      } else {
        // Otherwise, try to split city and state (e.g., "Chico, CA")
        const parts = input.split(",");
        if (parts.length === 2) {
          const city = parts[0].trim();
          const state = parts[1].trim();
          url += `?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
        } else {
          setError("Please enter a zip code or 'City, State'.");
          setLoading(false);
          return;
        }
      }
      const res = await fetch(url);
      let farms: Farm[] = [];
      if (!res.ok) {
        // Try to get error message from backend
        const errorJson = await res.json();
        setError(errorJson.error || "API request failed");
        setResults([]);
      } else {
        const data = await res.json();
        console.log("API response:", data);
        farms = Array.isArray(data) ? data : [];
        setResults(farms);
      }
    } catch {
      setError("Failed to fetch farm data.");
      setResults([]);
    }
    setLoading(false);
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
              <li>
                <a href="/add-farm" className="hover:text-amber-200">
                  Add Farm
                </a>
              </li>
              {session ? (
                <li>
                  <button
                    onClick={() => signOut()}
                    className="hover:text-amber-200"
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <a href="/login" className="hover:text-amber-200">
                    Login
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center py-16 px-4">
        <section className="w-full max-w-xl bg-white/80 rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">Find Local Farms Near You</h2>
          <p className="mb-6 text-amber-900 text-center">Enter your city or zip code to discover nearby farms and fresh produce.</p>
          {/* Search form */}
          <form className="flex flex-col w-full max-w-md mx-auto mb-8 gap-2" onSubmit={handleSubmit}>
            <div className="flex">
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
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="radius" className="text-green-700 font-medium">Radius (miles):</label>
              <input
                id="radius"
                type="number"
                min="1"
                max="100"
                value={radius}
                onChange={handleRadiusChange}
                className="w-20 px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </form>
          {/* Results list */}
          <div className="w-full">
            {loading ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="bg-white shadow rounded p-6 text-center text-red-500">{error}</div>
            ) : results.length === 0 ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                No farms found. Please search to see results.
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map((farm) => (
                  <li key={farm.MarketName + farm.Zip} className="bg-green-50 border border-green-200 rounded p-4 shadow">
                    <h3 className="text-xl font-semibold text-green-700">{farm.MarketName}</h3>
                    <p className="text-gray-700">{farm.Address}</p>
                    <p className="text-gray-600">City: {farm.City} | Zip: {farm.Zip}</p>
                    <p className="text-gray-600">Contact: {farm.Phone || "N/A"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        {/* User-Submitted Farms Section */}
        <section className="w-full max-w-4xl bg-white/80 rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">User-Submitted Farms</h2>
          <p className="mb-6 text-amber-900 text-center">Farms added by our community.</p>
          <div className="w-full">
            {userFarmsLoading ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">Loading user farms...</div>
            ) : userFarms.length === 0 ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                No user-submitted farms yet. <a href="/add-farm" className="text-green-600 hover:underline">Add one here</a>.
              </div>
            ) : (
              <ul className="space-y-4">
                {userFarms.map((farm) => (
                  <li key={farm._id || farm.MarketName + farm.Zip} className="bg-green-50 border border-green-200 rounded p-4 shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-green-700">{farm.MarketName}</h3>
                        <p className="text-sm text-green-600 font-medium">{farm.FarmType}</p>
                        <p className="text-gray-700">{farm.Address}</p>
                        <p className="text-gray-600">City: {farm.City} | Zip: {farm.Zip}</p>
                        <p className="text-gray-600">Contact: {farm.Phone || "N/A"}</p>
                        {farm.Description && (
                          <p className="text-gray-600 mt-2 italic">{farm.Description}</p>
                        )}
                      </div>
                      <a
                        href={`/edit-farm/${farm._id}`}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </a>
                    </div>
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
