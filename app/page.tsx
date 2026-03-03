"use client";
import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFarms, fetchUserFarms, type UiFarm } from "../lib/api/farms";
import { useFarmSearchStore } from "../lib/store/useFarmSearchStore";

const ResultsMap = dynamic(() => import("./components/ResultsMap"), { ssr: false });
const AddFarmModal = dynamic(() => import("./components/AddFarmModal"), { ssr: false });

type Farm = UiFarm;

export default function Home() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const searchInput = useFarmSearchStore((s) => s.searchInput);
  const radiusInput = useFarmSearchStore((s) => s.radiusInput);
  const submitted = useFarmSearchStore((s) => s.submitted);
  const page = useFarmSearchStore((s) => s.page);
  const validationError = useFarmSearchStore((s) => s.validationError);
  const setSearchInput = useFarmSearchStore((s) => s.setSearchInput);
  const setRadiusInput = useFarmSearchStore((s) => s.setRadiusInput);
  const setPage = useFarmSearchStore((s) => s.setPage);
  const submit = useFarmSearchStore((s) => s.submit);

  const [addOpen, setAddOpen] = useState(false);

  const handleFarmAdded = (farm: Farm) => {
    queryClient.setQueryData<Farm[]>(["user-farms"], (prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return [farm, ...list];
    });
  };

  const userFarmsQuery = useQuery({
    queryKey: ["user-farms"],
    queryFn: fetchUserFarms,
  });

  const farmsQuery = useQuery({
    queryKey: ["farms-search", submitted],
    queryFn: () => {
      if (!submitted) return Promise.resolve([] as Farm[]);
      return fetchFarms(submitted);
    },
    enabled: !!submitted,
  });

  const results = useMemo(() => farmsQuery.data ?? [], [farmsQuery.data]);
  const loading = farmsQuery.isFetching;
  const error = validationError || (farmsQuery.error instanceof Error ? farmsQuery.error.message : "");
  const userFarms = userFarmsQuery.data ?? [];
  const userFarmsLoading = userFarmsQuery.isLoading;

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pageResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page]);

  // Handle search input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle radius input change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadiusInput(e.target.value);
  };

  // Handle form submit to fetch farms from API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = submit();
    if (!next) return;

    // If user submits the same params again, force a refetch.
    await queryClient.invalidateQueries({ queryKey: ["farms-search"] });
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
        <section className="w-full max-w-5xl bg-white/80 rounded-lg shadow-lg p-6 md:p-8 mt-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">Find Local Farms Near You</h2>
          <p className="mb-6 text-amber-900 text-center">Enter your city or zip code to discover nearby farms and fresh produce.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Form + Results */}
            <div>
              <form className="flex flex-col w-full mb-6 gap-2" onSubmit={handleSubmit}>
                <div className="flex">
                  <input
                    type="text"
                    value={searchInput}
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
                    value={radiusInput}
                    onChange={handleRadiusChange}
                    className="w-20 px-2 py-1 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </form>
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
                  <>
                    <ul className="space-y-4">
                      {pageResults.map((farm) => (
                        <li key={farm.MarketName + farm.Zip} className="bg-green-50 border border-green-200 rounded p-4 shadow">
                          <h3 className="text-xl font-semibold text-green-700">{farm.MarketName}</h3>
                          <p className="text-gray-700">{farm.Address}</p>
                          <p className="text-gray-600">City: {farm.City} | Zip: {farm.Zip}</p>
                          <p className="text-gray-600">Contact: {farm.Phone || "N/A"}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className={`px-3 py-1 rounded border ${page <= 1 ? "text-gray-400 border-gray-200" : "text-green-700 border-green-300 hover:bg-green-50"}`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                      <button
                        type="button"
                        onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className={`px-3 py-1 rounded border ${page >= totalPages ? "text-gray-400 border-gray-200" : "text-green-700 border-green-300 hover:bg-green-50"}`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Right: Map */}
            <div className="h-96">
              <ResultsMap
                markers={useMemo(() => (
                  results
                    .filter((f) => typeof f.Lat === 'number' && typeof f.Lng === 'number')
                    .map((f) => ({ lat: f.Lat as number, lng: f.Lng as number, title: f.MarketName }))
                ), [results])}
              />
            </div>
          </div>
        </section>
        {/* User-Submitted Farms Section */}
        <section className="w-full max-w-5xl bg-white/80 rounded-lg shadow-lg p-6 md:p-8 mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-green-800">User-Submitted Farms</h2>
            <button
              onClick={() => setAddOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Farm
            </button>
          </div>
          <p className="mt-2 mb-6 text-amber-900">Farms added by our community.</p>
          <div className="w-full">
            {userFarmsLoading ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">Loading user farms...</div>
            ) : userFarms.length === 0 ? (
              <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                No user-submitted farms yet.
                <button onClick={() => setAddOpen(true)} className="ml-1 text-green-600 hover:underline">Add one here</button>.
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
      <AddFarmModal
        open={addOpen}
        onCloseAction={() => setAddOpen(false)}
        onAddedAction={(f) => handleFarmAdded(f as Farm)}
      />
    </div>
  );
}
