"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ============================================
   Types
   ============================================ */
interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/* ============================================
   SVG Icons
   ============================================ */
const iconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const iconPencil = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
  </svg>
);

const iconArchive = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const iconRestore = (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
  </svg>
);

const iconCheck = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const iconX = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

/* ============================================
   Default category colors
   ============================================ */
const DEFAULT_COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

/* ============================================
   Component
   ============================================ */
export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/categories?includeInactive=true");
        const json: ApiResponse<Category[]> = await res.json();
        if (!ignore && json.success) {
          setCategories(json.data);
        }
      } catch {
        if (!ignore) setFeedback({ type: "error", message: "Error al cargar categorías" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [refreshKey]);

  const reloadCategories = () => setRefreshKey((k) => k + 1);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (res.ok) {
        setNewName("");
        setNewColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
        setShowCreateForm(false);
        setFeedback({ type: "success", message: "Categoría creada" });
        reloadCategories();
      } else if (res.status === 409) {
        setFeedback({ type: "error", message: "La categoría ya existe" });
      } else {
        setFeedback({ type: "error", message: "Error al crear la categoría" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color ?? DEFAULT_COLORS[0]);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    setEditSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (res.ok) {
        cancelEdit();
        setFeedback({ type: "success", message: "Categoría actualizada" });
        reloadCategories();
      } else if (res.status === 409) {
        setFeedback({ type: "error", message: "El nombre ya existe" });
      } else {
        setFeedback({ type: "error", message: "Error al actualizar" });
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    setFeedback(null);
    try {
      if (cat.isActive) {
        // Deactivate (soft-delete)
        const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
        if (res.ok) {
          setFeedback({ type: "success", message: `"${cat.name}" desactivada` });
          reloadCategories();
        }
      } else {
        // Reactivate
        const res = await fetch(`/api/categories/${cat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
        if (res.ok) {
          setFeedback({ type: "success", message: `"${cat.name}" reactivada` });
          reloadCategories();
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Error de conexión" });
    }
  };

  const activeCategories = categories.filter((c) => c.isActive);
  const inactiveCategories = categories.filter((c) => !c.isActive);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categorías</CardTitle>
          <Button
            id="settings-category-add"
            size="sm"
            variant={showCreateForm ? "ghost" : "default"}
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setFeedback(null);
            }}
          >
            {showCreateForm ? (
              <>
                {iconX}
                <span className="ml-1">Cancelar</span>
              </>
            ) : (
              <>
                {iconPlus}
                <span className="ml-1">Nueva</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feedback */}
        {feedback && (
          <p
            role="status"
            className={
              feedback.type === "success"
                ? "text-sm text-success"
                : "text-sm text-danger"
            }
          >
            {feedback.message}
          </p>
        )}

        {/* Create form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="settings-category-new-name">Nombre</Label>
              <Input
                id="settings-category-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Mascotas"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-category-new-color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-category-new-color"
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {newColor}
                </span>
              </div>
            </div>
            <Button
              id="settings-category-create"
              type="submit"
              size="sm"
              disabled={creating || !newName.trim()}
            >
              {creating ? "Creando…" : "Crear categoría"}
            </Button>
          </form>
        )}

        {/* Category list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="space-y-1">
            {activeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                {editingId === cat.id ? (
                  /* Edit mode */
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
                      aria-label="Color de categoría"
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 max-w-48 text-sm"
                      aria-label="Nombre de categoría"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(cat.id)}
                      disabled={editSaving}
                      className="rounded-md p-1.5 text-success hover:bg-success/10 transition-colors"
                      aria-label="Guardar"
                    >
                      {iconCheck}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                      aria-label="Cancelar edición"
                    >
                      {iconX}
                    </button>
                  </div>
                ) : (
                  /* Display mode */
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color ?? "#a8a29e" }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label={`Editar ${cat.name}`}
                      >
                        {iconPencil}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                        aria-label={`Desactivar ${cat.name}`}
                      >
                        {iconArchive}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {activeCategories.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay categorías activas
              </p>
            )}
          </div>
        )}

        {/* Inactive categories toggle */}
        {inactiveCategories.length > 0 && (
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors",
                "flex items-center gap-2"
              )}
            >
              <span
                className={cn(
                  "inline-block transition-transform duration-150",
                  showInactive ? "rotate-90" : "rotate-0"
                )}
              >
                ▸
              </span>
              Inactivas ({inactiveCategories.length})
            </button>

            {showInactive && (
              <div className="mt-2 space-y-1">
                {inactiveCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color ?? "#a8a29e" }}
                        aria-hidden="true"
                      />
                      <span className="text-sm line-through">{cat.name}</span>
                      <Badge variant="secondary">Inactiva</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"
                      aria-label={`Reactivar ${cat.name}`}
                    >
                      {iconRestore}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
