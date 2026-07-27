import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./BestSellerPosters.module.scss";
import profile from "../../img/icons/profile.black.png";
import type { Item } from "../productCard/ProductCard";
import { API_ENDPOINTS } from "../../constants/constants";
import { compressImage } from "../../utils/imageCompression";

export interface BestSellerPoster {
  _id: string;
  name: string;
  imageUrl: string;
  optimizeUrl: string;
  itemId: string | null;
  order: number;
}

interface BestSellerPostersProps {
  items: Item[];
  isAdmin: boolean;
  onOpenProduct: (item: Item) => void;
}

const MAX_POSTERS = 8;

const BestSellerPosters: React.FC<BestSellerPostersProps> = ({ items, isAdmin, onOpenProduct }) => {
  const [posters, setPosters] = useState<BestSellerPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const addInputRef = useRef<HTMLInputElement>(null);

  const fetchPosters = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_BEST_SELLERS);
      setPosters(res.data.data || []);
    } catch {
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const authHeaders = () => {
    const accessToken = localStorage.getItem("accessToken");
    return { Authorization: accessToken ? `Bearer ${accessToken}` : "" };
  };

  const setBusy = (id: string, value: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const amount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleAddPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (posters.length >= MAX_POSTERS) {
      toast.error(`You can only have up to ${MAX_POSTERS} posters.`);
      return;
    }
    const formData = new FormData();
    formData.append("image", await compressImage(file, { maxDimension: 1000, quality: 0.8 }));
    formData.append("name", "New Poster");
    try {
      setBusy("add", true);
      const res = await axios.post(API_ENDPOINTS.CREATE_BEST_SELLER, formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        withCredentials: true,
      });
      setPosters((prev) => [...prev, res.data.data]);
      toast.success("Poster added.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to add poster.");
    } finally {
      setBusy("add", false);
    }
  };

  const handleImageChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("image", await compressImage(file, { maxDimension: 1000, quality: 0.8 }));
    try {
      setBusy(id, true);
      const res = await axios.put(API_ENDPOINTS.UPDATE_BEST_SELLER(id), formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        withCredentials: true,
      });
      setPosters((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
      toast.success("Poster image updated.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to update image.");
    } finally {
      setBusy(id, false);
    }
  };

  const saveTextField = async (id: string, patch: { name?: string; itemId?: string | null }) => {
    const formData = new FormData();
    if (patch.name !== undefined) formData.append("name", patch.name);
    if (patch.itemId !== undefined) formData.append("itemId", patch.itemId || "");
    try {
      setBusy(id, true);
      const res = await axios.put(API_ENDPOINTS.UPDATE_BEST_SELLER(id), formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        withCredentials: true,
      });
      setPosters((prev) => prev.map((p) => (p._id === id ? res.data.data : p)));
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to save changes.");
    } finally {
      setBusy(id, false);
    }
  };

  // Local-only update while typing — persisted on blur via saveTextField.
  const updateNameLocal = (id: string, name: string) => {
    setPosters((prev) => prev.map((p) => (p._id === id ? { ...p, name } : p)));
  };

  const handleRemovePoster = async (id: string) => {
    if (posters.length <= 1) {
      toast.error("You need at least one poster.");
      return;
    }
    try {
      setBusy(id, true);
      await axios.delete(API_ENDPOINTS.DELETE_BEST_SELLER(id), {
        headers: authHeaders(),
        withCredentials: true,
      });
      setPosters((prev) => prev.filter((p) => p._id !== id));
      toast.success("Poster removed.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to remove poster.");
      setBusy(id, false);
    }
  };

  const handleTileClick = (poster: BestSellerPoster) => {
    if (editing) return;
    if (!poster.itemId) return;
    const linked = items.find((i) => i._id === poster.itemId);
    if (linked) onOpenProduct(linked);
    else toast.error("This product is no longer available.");
  };

  if (loading) return null;
  if (posters.length === 0 && !isAdmin) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Our Best Sellers</h2>
        <div className={styles.headerActions}>
          {isAdmin && (
            <button
              className={`${styles.manageBtn} ${editing ? styles.manageBtnActive : ""}`}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Done" : "✎ Manage"}
            </button>
          )}
          {posters.length > 0 && (
            <div className={styles.nav}>
              <button aria-label="Scroll left" onClick={() => scroll("left")}>&#10094;</button>
              <button aria-label="Scroll right" onClick={() => scroll("right")}>&#10095;</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.track} ref={scrollRef}>
        {posters.map((poster) => {
          const linkedItem = poster.itemId ? items.find((i) => i._id === poster.itemId) : undefined;
          const isBusy = busyIds.has(poster._id);
          return (
            <div
              key={poster._id}
              className={`${styles.card} ${editing ? styles.cardEditing : ""}`}
              role={!editing && poster.itemId ? "button" : undefined}
              tabIndex={!editing && poster.itemId ? 0 : undefined}
              onClick={() => handleTileClick(poster)}
              onKeyDown={(e) => {
                if (!editing && (e.key === "Enter" || e.key === " ")) handleTileClick(poster);
              }}
            >
              <div className={styles.imageWrap}>
                <img
                  src={poster.optimizeUrl || poster.imageUrl || (profile as string)}
                  alt={poster.name}
                  onError={(ev) => {
                    (ev.target as HTMLImageElement).src = profile as string;
                  }}
                />

                {editing && (
                  <div className={styles.editOverlay} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={(el) => {
                        fileInputRefs.current[poster._id] = el;
                      }}
                      onChange={(e) => handleImageChange(poster._id, e)}
                    />
                    <button
                      className={styles.overlayBtn}
                      disabled={isBusy}
                      onClick={() => fileInputRefs.current[poster._id]?.click()}
                    >
                      🔄 Replace image
                    </button>
                    <button
                      className={styles.overlayRemoveBtn}
                      disabled={isBusy}
                      onClick={() => handleRemovePoster(poster._id)}
                    >
                      🗑 Remove
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.info}>
                {editing ? (
                  <>
                    <input
                      className={styles.nameInput}
                      type="text"
                      value={poster.name}
                      placeholder="Poster name"
                      disabled={isBusy}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateNameLocal(poster._id, e.target.value)}
                      onBlur={(e) => saveTextField(poster._id, { name: e.target.value })}
                    />
                    <select
                      className={styles.linkSelect}
                      value={poster.itemId || ""}
                      disabled={isBusy}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => saveTextField(poster._id, { itemId: e.target.value || null })}
                    >
                      <option value="">No linked product</option>
                      {items.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <h3 className={styles.name}>{poster.name || linkedItem?.name}</h3>
                )}
              </div>
            </div>
          );
        })}

        {editing && posters.length < MAX_POSTERS && (
          <>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={addInputRef}
              onChange={handleAddPoster}
            />
            <button className={styles.addCard} onClick={() => addInputRef.current?.click()} disabled={busyIds.has("add")}>
              <span className={styles.addIcon}>+</span>
              <span>Add Poster</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default BestSellerPosters;
