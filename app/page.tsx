"use client";
import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFarms, fetchUserFarms, type UiFarm } from "../lib/api/farms";
import { focusMapOn } from "../lib/mapBridge";
import { useFarmSearchStore } from "../lib/store/useFarmSearchStore";

const ResultsMap = dynamic(() => import("./components/ResultsMap"), { ssr: false });
const AddFarmModal = dynamic(() => import("./components/AddFarmModal"), { ssr: false });

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
  const [selectedFarmKey, setSelectedFarmKey] = useState<string | null>(null);
  const [producesFilter, setProducesFilter] = useState<string>("");

  const handleFarmAdded = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user-farms"] });
  };

  const userFarmsQuery = useQuery({
    queryKey: ["user-farms"],
    queryFn: fetchUserFarms,
    staleTime: 30_000,
  });

  const farmsQuery = useQuery({
    queryKey: ["farms-search", submitted],
    queryFn: () => {
      if (!submitted) return Promise.resolve([] as UiFarm[]);
      return fetchFarms(submitted);
    },
    enabled: !!submitted,
  });

  const results = useMemo(() => farmsQuery.data ?? [], [farmsQuery.data]);
  const loading = farmsQuery.isFetching;
  const error = validationError || (farmsQuery.error instanceof Error ? farmsQuery.error.message : "");
  const userFarms = useMemo(() => userFarmsQuery.data ?? [], [userFarmsQuery.data]);
  const userFarmsLoading = userFarmsQuery.isLoading;

  const mapMarkers = useMemo(() => {
    const searchMarkers = results
      .filter((f) => typeof f.Lat === "number" && typeof f.Lng === "number")
      .map((f) => ({ lat: f.Lat as number, lng: f.Lng as number, title: f.MarketName }));
    const userMarkers = userFarms
      .filter((f) => typeof f.Lat === "number" && typeof f.Lng === "number")
      .map((f) => ({ lat: f.Lat as number, lng: f.Lng as number, title: f.MarketName }));
    return [...searchMarkers, ...userMarkers];
  }, [results, userFarms]);

  const filteredResults = useMemo(() => {
    if (!producesFilter) return results;
    return results.filter((f) =>
      Array.isArray(f.Produces) && f.Produces.some((p: string) => p.toLowerCase() === producesFilter.toLowerCase())
    );
  }, [results, producesFilter]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const pageResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, page]);

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
    setSelectedFarmKey(null);
    setProducesFilter("");
    await queryClient.invalidateQueries({ queryKey: ["farms-search"] });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-100 via-amber-50 to-blue-100 font-sans">
      <header className="w-full sticky top-0 z-40 bg-white/30 backdrop-blur-md text-green-900 border-b border-white/40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl select-none">🌾</span>
            <span className="text-lg font-bold tracking-tight text-green-900 group-hover:text-green-600 transition-colors duration-200">
              United Farms of America
            </span>
          </a>
          {/* Nav */}
          <nav>
            <ul className="flex items-center gap-1 text-sm font-medium">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="relative px-4 py-2 rounded-md text-green-900 hover:text-green-700 hover:bg-white/50 transition-all duration-200 group"
                  >
                    {label}
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                  </a>
                </li>
              ))}
              <li className="ml-2">
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-1.5 rounded-full border border-green-700 text-green-800 hover:bg-green-700 hover:text-white transition-all duration-200 font-semibold text-sm backdrop-blur-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="px-4 py-1.5 rounded-full border border-green-700 text-green-800 hover:bg-green-700 hover:text-white transition-all duration-200 font-semibold text-sm backdrop-blur-sm"
                  >
                    Login
                  </a>
                )}
              </li>
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
              {results.length > 0 && (
                <div className="mb-3 flex items-center gap-2">
                  <label className="text-sm text-green-700 font-medium">Filter by:</label>
                  <select
                    value={producesFilter}
                    onChange={(e) => { setProducesFilter(e.target.value); setPage(1); }}
                    className="text-sm border border-green-300 rounded px-2 py-1 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">All</option>
                    {["Vegetables","Fruits","Herbs","Beef","Pork","Poultry","Lamb","Dairy","Eggs","Honey","Flowers","Other"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="w-full">
                {loading ? (
                  <div className="bg-white shadow rounded p-6 text-center text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="bg-white shadow rounded p-6 text-center text-red-500">{error}</div>
                ) : filteredResults.length === 0 && results.length > 0 ? (
                  <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                    No farms match that filter.
                  </div>
                ) : results.length === 0 ? (
                  <div className="bg-white shadow rounded p-6 text-center text-gray-500">
                    No farms found. Please search to see results.
                  </div>
                ) : (
                  <>
                    <ul className="space-y-4">
                      {pageResults.map((farm) => (
                        <li
                          key={farm.MarketName + farm.Zip}
                          className={`bg-green-50 border rounded p-4 shadow cursor-pointer transition-colors ${
                            selectedFarmKey === farm.MarketName + farm.Zip
                              ? "border-green-500 ring-2 ring-green-400"
                              : "border-green-200 hover:border-green-400"
                          }`}
                          onClick={() => {
                            console.log("[page] card clicked", farm.MarketName, "Lat:", farm.Lat, "Lng:", farm.Lng);
                            if (typeof farm.Lat === "number" && typeof farm.Lng === "number") {
                              setSelectedFarmKey(farm.MarketName + farm.Zip);
                              focusMapOn(farm.Lat, farm.Lng, farm.MarketName);
                            } else {
                              console.warn("[page] farm has no coordinates", farm);
                            }
                          }}
                        >
                          <h3 className="text-xl font-semibold text-green-700">{farm.MarketName}</h3>
                          <p className="text-gray-700 text-sm">{farm.Address}</p>
                          <p className="text-gray-600 text-sm">{farm.City}{farm.State ? `, ${farm.State}` : ""} {farm.Zip}</p>
                          {Array.isArray(farm.Produces) && farm.Produces.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {farm.Produces.map((p: string) => (
                                <span key={p} className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">{p}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-gray-500 text-xs mt-1">Contact: {farm.Phone || "N/A"}</p>
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
                      <span className="text-sm text-gray-600">Page {page} of {totalPages} ({filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""})</span>
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
            <div className="h-[420px] min-h-[300px]">
              <ResultsMap markers={mapMarkers} />
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
                  <li
                    key={farm._id || farm.MarketName + farm.Zip}
                    className={`bg-green-50 border rounded p-4 shadow transition-colors ${
                      typeof farm.Lat === "number" && typeof farm.Lng === "number"
                        ? "cursor-pointer border-green-200 hover:border-green-400"
                        : "border-green-200"
                    }`}
                    onClick={() => {
                      if (typeof farm.Lat === "number" && typeof farm.Lng === "number") {
                        window.scrollTo({ top: 0, behavior: "instant" });
                        focusMapOn(farm.Lat, farm.Lng, farm.MarketName);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-green-700">{farm.MarketName}</h3>
                        {Array.isArray(farm.Produces) && farm.Produces.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-1">
                            {farm.Produces.map((p) => (
                              <span key={p} className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">{p}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-700 text-sm">{farm.Address}</p>
                        <p className="text-gray-600 text-sm">{farm.City}{farm.State ? `, ${farm.State}` : ""} {farm.Zip}</p>
                        <p className="text-gray-600 text-sm">Contact: {farm.Phone || "N/A"}</p>
                        {farm.Description && (
                          <p className="text-gray-600 mt-2 italic text-sm">{farm.Description}</p>
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
        onAddedAction={handleFarmAdded}
      />
    </div>
  );
}
