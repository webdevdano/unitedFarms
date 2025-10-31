"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditFarmPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch farm data on mount
  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const res = await fetch(`/api/farms/${id}`);
        if (res.ok) {
          const farm = await res.json();
          setForm({
            name: farm.name,
            address: farm.address,
            city: farm.city,
            state: farm.state,
            zip: farm.zip,
            phone: farm.phone || "",
          });
        } else {
          setError("Farm not found.");
        }
      } catch {
        setError("Failed to load farm.");
      } finally {
        setFetchLoading(false);
      }
    };
    if (id) fetchFarm();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/farms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to update farm.");
      } else {
        setSuccess("Farm updated successfully!");
      }
    } catch {
      setError("Failed to update farm.");
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-green-800">Loading farm...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Edit Farm</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Farm Name" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="state" value={form.state} onChange={handleChange} required placeholder="State" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="zip" value={form.zip} onChange={handleChange} required placeholder="Zip Code" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="w-full text-green-500 border px-3 py-2 rounded" />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {loading ? "Updating..." : "Update Farm"}
        </button>
        {success && <div className="text-green-700 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
      <Link href="/" className="mt-4 text-green-600 hover:underline">Back to Home</Link>
    </div>
  );
}