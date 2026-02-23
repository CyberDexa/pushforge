"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Globe, Users } from "lucide-react";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Products() {
  const { state, dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetAudience: "both" as "b2b" | "b2c" | "both",
    keyFeatures: "",
    website: "",
  });

  const resetForm = () => {
    setForm({ name: "", description: "", targetAudience: "both", keyFeatures: "", website: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      targetAudience: product.targetAudience,
      keyFeatures: product.keyFeatures.join(", "),
      website: product.website || "",
    });
    setEditing(product);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    const product: Product = {
      id: editing?.id || generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      targetAudience: form.targetAudience,
      keyFeatures: form.keyFeatures
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      website: form.website.trim() || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };

    if (editing) {
      dispatch({ type: "UPDATE_PRODUCT", product });
    } else {
      dispatch({ type: "ADD_PRODUCT", product });
    }
    resetForm();
  };

  const audienceLabels = { b2b: "B2B", b2c: "B2C", both: "B2B + B2C" };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Products</h2>
          <p className="text-slate-400 text-sm">
            Your SaaS products to market
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editing ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., InvoiceBot"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Description (what problem does it solve?) *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Automates invoice generation and payment tracking for freelancers..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Target Audience
                </label>
                <div className="flex gap-2">
                  {(["b2b", "b2c", "both"] as const).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, targetAudience: val })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.targetAudience === val
                          ? "bg-forge-600/20 text-forge-400 border border-forge-600/30"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {audienceLabels[val]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Key Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.keyFeatures}
                  onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
                  placeholder="e.g., auto-invoicing, payment tracking, client portal"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-forge-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl forge-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Cards */}
      {state.products.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-forge-600/10 mx-auto flex items-center justify-center mb-4">
            <Plus className="w-7 h-7 text-forge-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">No products yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Add your SaaS products to start generating marketing content
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.products.map((product) => {
            const contentCount = state.generatedContent.filter(
              (c) => c.productId === product.id
            ).length;
            return (
              <div
                key={product.id}
                className="glass-card rounded-2xl p-5 hover:border-slate-600/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-forge-600/15 text-forge-400 font-medium">
                        {audienceLabels[product.targetAudience]}
                      </span>
                      {product.website && (
                        <a
                          href={product.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-forge-400 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => dispatch({ type: "DELETE_PRODUCT", id: product.id })}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {product.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.keyFeatures.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400"
                      >
                        {f}
                      </span>
                    ))}
                    {product.keyFeatures.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-500">
                        +{product.keyFeatures.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {contentCount} pieces generated
                  </span>
                  <button
                    onClick={() => dispatch({ type: "SET_VIEW", view: "generate" })}
                    className="text-[11px] text-forge-400 hover:text-forge-300 font-medium transition-colors"
                  >
                    Generate →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
