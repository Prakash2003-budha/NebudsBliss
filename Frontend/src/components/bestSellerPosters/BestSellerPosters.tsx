import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "./BestSellerPosters.module.scss";
import profile from "../../img/icons/profile.black.png";
import type { Item } from "../productCard/ProductCard";

export interface BestSellerPoster {
  id: string;
  name: string;
  imageUrl: string | null;
  itemId: string | null;
}

interface BestSellerPostersProps {
  items: Item[];
  isAdmin: boolean;
  onOpenProduct: (item: Item) => void;
}

const STORAGE_KEY = "bestSellerPosters_v1";
const MIN_POSTERS = 4;
const MAX_POSTERS = 8;
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // ~1.5MB, keeps localStorage happy

const makeId = () => `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const seedFromItems = (items: Item[]): BestSellerPoster[] =>
  items.slice(0, MIN_POSTERS).map((item) => ({
    id: makeId(),
    name: item.name,
    imageUrl: item.images?.[0]?.optimizeUrl || item.images?.[0]?.url || null,
    itemId: item._id,
  }));

const loadPosters = (): BestSellerPoster[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
};

const savePosters = (posters: BestSellerPoster[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
  } catch {
    toast.error("Couldn't save — images may be too large for local storage.");
  }
};

const BestSellerPosters: React.FC<BestSellerPostersProps> = ({ items, isAdmin, onOpenProduct }) => {
  const [posters, setPosters] = useState<BestSellerPoster[]>([]);
  const [editing, setEditing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load from localStorage once, seeding defaults from real items the first time.
  useEffect(() => {
    if (initialized) return;
    const stored = loadPosters();
    if (stored && stored.length > 0) {
      setPosters(stored);
      setInitialized(true);
    } else if (items.length > 0) {
      const seeded = seedFromItems(items);
      setPosters(seeded);
      savePosters(seeded);
      setInitialized(true);
    }
  }, [items, initialized]);

  const persist = (next: BestSellerPoster[]) => {
    setPosters(next);
    savePosters(next);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const amount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const updatePoster = (id: string, patch: Partial<BestSellerPoster>) => {
    persist(posters.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large — please use one under 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updatePoster(id, { imageUrl: reader.result as string });
      toast.success("Poster image updated.");
    };
    reader.onerror = () => toast.error("Couldn't read that image.");
    reader.readAsDataURL(file);
  };

  const handleAddPoster = () => {
    if (posters.length >= MAX_POSTERS) {
      toast.error(`You can only have up to ${MAX_POSTERS} posters.`);
      return;
    }
    const next = [...posters, { id: makeId(), name: "New Poster", imageUrl: null, itemId: null }];
    persist(next);
  };

  const handleRemovePoster = (id: string) => {
    if (posters.length <= 1) {
      toast.error("You need at least one poster.");
      return;
    }
    persist(posters.filter((p) => p.id !== id));
  };

  const handleTileClick = (poster: BestSellerPoster) => {
    if (editing) return;
    if (!poster.itemId) return;
    const linked = items.find((i) => i._id === poster.itemId);
    if (linked) onOpenProduct(linked);
    else toast.error("This product is no longer available.");
  };

  if (!initialized && items.length === 0) return null;
  if (posters.length === 0) return null;

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
          <div className={styles.nav}>
            <button aria-label="Scroll left" onClick={() => scroll("left")}>&#10094;</button>
            <button aria-label="Scroll right" onClick={() => scroll("right")}>&#10095;</button>
          </div>
        </div>
      </div>

      <div className={styles.track} ref={scrollRef}>
        {posters.map((poster) => {
          const linkedItem = poster.itemId ? items.find((i) => i._id === poster.itemId) : undefined;
          return (
            <div
              key={poster.id}
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
                  src={poster.imageUrl || (profile as string)}
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
                        fileInputRefs.current[poster.id] = el;
                      }}
                      onChange={(e) => handleImageChange(poster.id, e)}
                    />
                    <button
                      className={styles.overlayBtn}
                      onClick={() => fileInputRefs.current[poster.id]?.click()}
                    >
                      {poster.imageUrl ? "🔄 Replace image" : "📤 Upload image"}
                    </button>
                    <button
                      className={styles.overlayRemoveBtn}
                      onClick={() => handleRemovePoster(poster.id)}
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
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updatePoster(poster.id, { name: e.target.value })}
                    />
                    <select
                      className={styles.linkSelect}
                      value={poster.itemId || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updatePoster(poster.id, { itemId: e.target.value || null })}
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
          <button className={styles.addCard} onClick={handleAddPoster}>
            <span className={styles.addIcon}>+</span>
            <span>Add Poster</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default BestSellerPosters;
