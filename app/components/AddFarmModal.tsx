"use client";
import { useState } from "react";

type UiFarm = {
  _id?: string;
  MarketName: string;
  Address: string;
  City: string;
  Zip: string;
  Phone?: string;
  FarmType?: string;
  Description?: string;
  Lat?: number;
  Lng?: number;
};

export default function AddFarmModal({
  open,
  onCloseAction,
  onAddedAction,
}: {
  open: boolean;
  onCloseAction: () => void;
  onAddedAction: (farm: UiFarm) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    farmType: "Other",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/add-farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add farm.");
      }
      const created = await res.json();
      // Map created farm to UI shape used by the User-Submitted Farms section
      const uiFarm: UiFarm = {
        _id: created._id,
        MarketName: created.name,
        Address: created.address,
        City: created.city,
        Zip: created.zip,
        Phone: created.phone || "",
        FarmType: created.farmType || "Other",
        Description: created.description || "",
      };
  onAddedAction(uiFarm);
  onCloseAction();
      // reset form
      setForm({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        farmType: "Other",
        description: "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add farm.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCloseAction}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-green-800">Add a New Farm</h3>
          <button
            onClick={onCloseAction}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Farm Name" className="w-full text-green-600 border px-3 py-2 rounded" />
          <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full text-green-600 border px-3 py-2 rounded" />
          <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="w-full text-green-600 border px-3 py-2 rounded" />
          <div className="flex gap-2">
            <input name="state" value={form.state} onChange={handleChange} required placeholder="State" className="w-full text-green-600 border px-3 py-2 rounded" />
            <input name="zip" value={form.zip} onChange={handleChange} required placeholder="Zip Code" className="w-full text-green-600 border px-3 py-2 rounded" />
          </div>
          <select name="farmType" value={form.farmType} onChange={handleChange} required className="w-full text-green-600 border px-3 py-2 rounded">
            <option value="Produce">Produce</option>
            <option value="Beef">Beef</option>
            <option value="Poultry">Poultry</option>
            <option value="Dairy">Dairy</option>
            <option value="All">All</option>
            <option value="Other">Other</option>
          </select>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="w-full text-green-600 border px-3 py-2 rounded" />
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Description (optional, max 1000 characters)" 
            maxLength={1000}
            rows={3}
            className="w-full text-green-600 border px-3 py-2 rounded resize-none"
          />
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{form.description.length}/1000</span>
            {error && <span className="text-red-600">{error}</span>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            {loading ? "Adding..." : "Add Farm"}
          </button>
        </form>
      </div>
    </div>
  );
}
