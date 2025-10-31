"use client";
import { useState } from "react";

export default function AddFarmPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/add-farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to add farm.");
      } else {
        setSuccess("Farm added successfully!");
        setForm({ name: "", address: "", city: "", state: "", zip: "", phone: "" });
      }
    } catch (err) {
      setError("Failed to add farm.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Add a New Farm</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <input name="name" value={form.name} onChange={handleChange} required placeholder="Farm Name" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="state" value={form.state} onChange={handleChange} required placeholder="State" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="zip" value={form.zip} onChange={handleChange} required placeholder="Zip Code" className="w-full text-green-500 border px-3 py-2 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="w-full text-green-500 border px-3 py-2 rounded" />
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {loading ? "Adding..." : "Add Farm"}
        </button>
        {success && <div className="text-green-700 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
}
