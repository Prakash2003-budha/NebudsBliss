import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/constants";
import shared from "./admin.shared.module.scss";
import styles from "./AdminMedia.module.scss";
import ConfirmDialog from "./ConfirmDialog";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

interface Poster { imageUrl: string; optimizeUrl?: string; public_id?: string; }
interface HeroSlide { _id: string; imageUrl: string; optimizeUrl?: string; order: number; createdAt?: string; }
interface BestSellerPoster { _id: string; name: string; imageUrl: string; optimizeUrl?: string; itemId?: string | null; order?: number; createdAt?: string; }
interface ApiErrorBody { message?: string; }

type DeleteTarget =
  | { type: "poster" }
  | { type: "hero"; id: string }
  | { type: "seller"; id: string };

const imgSrc = (i?: { optimizeUrl?: string; url?: string } | null): string => i?.optimizeUrl || i?.url || "";
const errMsg = (e: unknown, fallback: string): string => {
  const body = (e as { response?: { data?: ApiErrorBody } })?.response?.data;
  return body?.message || fallback;
};

const MAX_HERO_SLIDES = 6;
const MAX_BEST_SELLERS = 8;

const FilePicker: React.FC<{
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
  disabled?: boolean;
  accept?: string;
}> = ({ label, file, setFile, disabled, accept = "image/*" }) => (
  <div className={styles.fileRow}>
    <span className={styles.fileLabel}>{label}</span>
    <input type="file" accept={accept} disabled={disabled} className={styles.fileInput} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
    {file && <span className={styles.fileName}>{file.name}</span>}
  </div>
);

const AdminMedia: React.FC = () => {
  const [poster, setPoster] = useState<Poster | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerPoster[]>([]);
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const newSellerNameRef = useRef<HTMLInputElement>(null);
  const newSellerItemRef = useRef<HTMLInputElement>(null);
  const [newSellerName, setNewSellerName] = useState("");
  const [newSellerItem, setNewSellerItem] = useState("");
  const [newSellerFile, setNewSellerFile] = useState<File | null>(null);
  const [addingSeller, setAddingSeller] = useState(false);
  const [editingSeller, setEditingSeller] = useState<BestSellerPoster | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftItem, setDraftItem] = useState("");
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [updatingSeller, setUpdatingSeller] = useState(false);
  const [replaceSlideId, setReplaceSlideId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, hRes, bRes] = await Promise.all([
        axios.get(API_ENDPOINTS.GET_POSTER, { headers: authHeaders() }),
        axios.get(API_ENDPOINTS.GET_HERO_SLIDES, { headers: authHeaders() }),
        axios.get(API_ENDPOINTS.GET_BEST_SELLERS, { headers: authHeaders() }),
      ]);
      setPoster(pRes.data?.data ?? null);
      setHeroSlides(Array.isArray(hRes.data?.data) ? hRes.data.data : []);
      setBestSellers(Array.isArray(bRes.data?.data) ? bRes.data.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load media content.");
    } finally {
      setLoading(false);
    }
    }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matches the established admin data-loading pattern (see AdminOrders)
    loadAll();
  }, [loadAll]);

  const uploadPoster = async () => {
    if (!posterFile) { toast.error("Please choose a banner image first."); return; }
    setUploadingPoster(true);
    try {
      const payload = new FormData();
      payload.append("image", posterFile);
      const res = await axios.post(API_ENDPOINTS.UPLOAD_POSTER, payload, { headers: authHeaders() });
      setPoster(res.data?.data ?? null);
      setPosterFile(null);
      toast.success("Homepage banner saved.");
    } catch (e) { toast.error(errMsg(e, "Failed to upload banner.")); }
    finally { setUploadingPoster(false); }
  };

  const deletePoster = async () => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_POSTER, { headers: authHeaders() });
      setPoster(null);
      toast.success("Homepage banner removed.");
    } catch (e) { toast.error(errMsg(e, "Failed to remove banner.")); }
  };

  const addHeroSlide = async () => {
    if (!heroFile) { toast.error("Please choose an image first."); return; }
    if (heroSlides.length >= MAX_HERO_SLIDES) { toast.warning(`You can have up to ${MAX_HERO_SLIDES} hero slides.`); return; }
    setUploadingHero(true);
    try {
      const payload = new FormData();
      payload.append("image", heroFile);
      const res = await axios.post(API_ENDPOINTS.CREATE_HERO_SLIDE, payload, { headers: authHeaders() });
      const created = res.data?.data as HeroSlide | undefined;
      if (created) setHeroSlides((prev) => [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setHeroFile(null);
      toast.success("Slide added to the carousel.");
    } catch (e) { toast.error(errMsg(e, "Failed to add slide.")); }
    finally { setUploadingHero(false); }
  };

  const startReplaceHero = (id: string) => {
    setReplaceSlideId(id);
    replaceInputRef.current?.click();
  };

  const onReplaceHeroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    const id = replaceSlideId;
    setReplaceSlideId(null);
    if (!file || !id) return;
    setUploadingHero(true);
    try {
      const payload = new FormData();
      payload.append("image", file);
      const res = await axios.put(API_ENDPOINTS.UPDATE_HERO_SLIDE(id), payload, { headers: authHeaders() });
      const updated = res.data?.data as HeroSlide | undefined;
      if (updated) setHeroSlides((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      toast.success("Slide image updated.");
    } catch (e) { toast.error(errMsg(e, "Failed to update slide.")); }
    finally { setUploadingHero(false); }
  };

  const deleteHeroSlide = async (id: string) => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_HERO_SLIDE(id), { headers: authHeaders() });
      setHeroSlides((prev) => prev.filter((s) => s._id !== id));
      toast.success("Slide removed from the carousel.");
    } catch (e) { toast.error(errMsg(e, "Failed to remove slide.")); }
  };

  const addBestSeller = async () => {
    if (!newSellerFile) { toast.error("Please choose an image."); return; }
    if (!newSellerName.trim()) { toast.error("A name is required."); return; }
    setAddingSeller(true);
    try {
      const payload = new FormData();
      payload.append("name", newSellerName.trim());
      payload.append("itemId", newSellerItem);
      payload.append("image", newSellerFile);
      const res = await axios.post(API_ENDPOINTS.CREATE_BEST_SELLER, payload, { headers: authHeaders() });
      const created = res.data?.data as BestSellerPoster | undefined;
      if (created) setBestSellers((prev) => [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setNewSellerName("");
      setNewSellerItem("");
      setNewSellerFile(null);
      toast.success("Poster added.");
    } catch (e) { toast.error(errMsg(e, "Failed to add poster.")); }
    finally { setAddingSeller(false); }
  };

  const openEditSeller = (seller: BestSellerPoster) => {
    setEditingSeller(seller);
    setDraftName(seller.name);
    setDraftItem(seller.itemId ?? "");
    setDraftFile(null);
    newSellerNameRef.current?.focus();
  };

  const cancelEditSeller = () => {
    setEditingSeller(null);
    setDraftName("");
    setDraftItem("");
    setDraftFile(null);
  };

  const saveSeller = async () => {
    if (!editingSeller) return;
    setUpdatingSeller(true);
    try {
      const payload = new FormData();
      payload.append("name", draftName.trim());
      payload.append("itemId", draftItem);
      if (draftFile) payload.append("image", draftFile);
      const res = await axios.put(API_ENDPOINTS.UPDATE_BEST_SELLER(editingSeller._id), payload, { headers: authHeaders() });
      const updated = res.data?.data as BestSellerPoster | undefined;
      if (updated) {
        setBestSellers((prev) =>
          prev.map((b) => (b._id === updated._id ? { ...updated, itemId: updated.itemId ?? null } : b))
        );
      }
      cancelEditSeller();
      toast.success("Poster updated.");
    } catch (e) { toast.error(errMsg(e, "Failed to update poster.")); }
    finally { setUpdatingSeller(false); }
  };

  const deleteBestSeller = async (id: string) => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_BEST_SELLER(id), { headers: authHeaders() });
      setBestSellers((prev) => prev.filter((b) => b._id !== id));
      toast.success("Poster removed.");
    } catch (e) { toast.error(errMsg(e, "Failed to remove poster.")); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "poster") {
      await deletePoster();
    } else if (deleteTarget.type === "hero") {
      await deleteHeroSlide(deleteTarget.id);
    } else {
      await deleteBestSeller(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  if (loading && !poster && heroSlides.length === 0 && bestSellers.length === 0) {
    return (
      <div className={shared.page}>
        <div className={shared.loading}>
          <span className={shared.spinner} />
          Loading media…
        </div>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHead}>
        <div>
          <h1 className={shared.pageTitle}>Media &amp; Banners</h1>
          <p className={shared.pageSubtitle}>
            Manage the homepage banner, the hero carousel slides, and the
            best-seller posters.
          </p>
        </div>
      </div>

      {/* Homepage banner */}
      <div className={styles.mediaSection}>
        <h2 className={styles.sectionTitle}>Homepage banner</h2>
        <div className={styles.sectionBody}>
          {poster ? (
            <div className={styles.posterView}>
              <img src={imgSrc(poster) || "/logo.transparent.png"} alt="Homepage banner" className={styles.posterImg} />
              <button type="button" className={`${shared.btn} ${shared.btnDanger}`} onClick={() => setDeleteTarget({ type: "poster" })}>
                Remove banner
              </button>
            </div>
          ) : (
            <p className={shared.muted}>
              No banner uploaded yet. Upload one below to show it on the
              homepage hero area.
            </p>
          )}
          <FilePicker label="Homepage banner" file={posterFile} setFile={setPosterFile} disabled={uploadingPoster} />
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={uploadPoster} disabled={uploadingPoster || !posterFile}>
            {uploadingPoster ? "Saving…" : "Save banner"}
          </button>
        </div>
      </div>

      {/* Hero carousel */}
      <div className={styles.mediaSection}>
        <h2 className={styles.sectionTitle}>Hero carousel <span className={shared.muted}>({heroSlides.length}/{MAX_HERO_SLIDES})</span></h2>
        <div className={styles.sectionBody}>
          {heroSlides.length === 0 ? (
            <p className={styles.emptyState}>No hero slides yet.</p>
          ) : (
            <div className={styles.heroGrid}>
              {heroSlides.map((slide) => (
                <div key={slide._id} className={styles.heroTile}>
                  <img src={imgSrc(slide) || "/logo.transparent.png"} alt={`Hero slide #${slide.order + 1}`} className={styles.heroThumb} />
                  <div className={styles.heroMeta}>Order #{slide.order + 1}</div>
                  <div className={styles.rowActions}>
                    <button type="button" className={`${shared.btn} ${shared.btnNeutral}`} onClick={() => startReplaceHero(slide._id)}>Replace image</button>
                    <button type="button" className={`${shared.btn} ${shared.btnDanger}`} onClick={() => setDeleteTarget({ type: "hero", id: slide._id })}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" ref={replaceInputRef} className={styles.hiddenInput} onChange={onReplaceHeroChange} />
          <FilePicker label="New hero slide" file={heroFile} setFile={setHeroFile} disabled={uploadingHero || heroSlides.length >= MAX_HERO_SLIDES} />
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={addHeroSlide} disabled={uploadingHero || !heroFile || heroSlides.length >= MAX_HERO_SLIDES}>
            {uploadingHero ? "Adding…" : "Add slide"}
          </button>
        </div>
      </div>

      {/* Best seller posters */}
      <div className={styles.mediaSection}>
        <h2 className={styles.sectionTitle}>Best seller posters <span className={shared.muted}>({bestSellers.length}/{MAX_BEST_SELLERS})</span></h2>
        <div className={styles.sectionBody}>
          {bestSellers.length === 0 ? (
            <p className={styles.emptyState}>No best-seller posters yet.</p>
          ) : (
            <div className={styles.sellerList}>
              {bestSellers.map((seller) =>
                editingSeller?._id === seller._id ? (
                  <div key={seller._id} className={styles.sellerRow} style={{ gridTemplateColumns: "64px 1fr 1fr 1fr auto" }}>
                    <img src={imgSrc(seller) || "/logo.transparent.png"} alt={seller.name} className={styles.sellerThumb} />
                    <input ref={newSellerNameRef} className={shared.input} placeholder="Name" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                    <input ref={newSellerItemRef} className={shared.input} placeholder="Product _id (optional)" value={draftItem} onChange={(e) => setDraftItem(e.target.value)} />
                    <input type="file" accept="image/*" className={styles.fileInput} onChange={(e) => setDraftFile(e.target.files?.[0] ?? null)} />
                    <div className={styles.sellerActions}>
                      <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={saveSeller} disabled={updatingSeller}>{updatingSeller ? "Saving…" : "Save"}</button>
                      <button type="button" className={`${shared.btn} ${shared.btnNeutral}`} onClick={cancelEditSeller} disabled={updatingSeller}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div key={seller._id} className={styles.sellerRow}>
                    <img src={imgSrc(seller) || "/logo.transparent.png"} alt={seller.name} className={styles.sellerThumb} />
                    <div className={styles.sellerName}>{seller.name}</div>
                    <div className={styles.sellerItem}>{seller.itemId || "— no product link"}</div>
                    <div className={styles.sellerOrder}>#{seller.order}</div>
                    <div className={styles.sellerActions}>
                      <button type="button" className={`${shared.btn} ${shared.btnNeutral}`} onClick={() => openEditSeller(seller)}>Edit</button>
                      <button type="button" className={`${shared.btn} ${shared.btnDanger}`} onClick={() => setDeleteTarget({ type: "seller", id: seller._id })}>Remove</button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className={styles.creatorRow}>
            <div className={styles.creatorName}>
              <input className={shared.input} placeholder="Poster name" value={newSellerName} onChange={(e) => setNewSellerName(e.target.value)} disabled={addingSeller} />
            </div>
            <div className={styles.creatorItem}>
              <input className={shared.input} placeholder="Product _id (optional)" value={newSellerItem} onChange={(e) => setNewSellerItem(e.target.value)} disabled={addingSeller} />
            </div>
            <div className={styles.fileInput}>
              <input type="file" accept="image/*" disabled={addingSeller || bestSellers.length >= MAX_BEST_SELLERS} onChange={(e) => setNewSellerFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className={styles.createBtn}>
              <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={addBestSeller} disabled={addingSeller || !newSellerName.trim() || !newSellerFile || bestSellers.length >= MAX_BEST_SELLERS}>
                {addingSeller ? "Adding…" : "Add poster"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove this media item?"
        message={
          !deleteTarget
            ? ""
            : deleteTarget.type === "poster"
            ? "The homepage banner will be removed from the store. You can upload a new one anytime."
            : deleteTarget.type === "hero"
            ? "This hero slide will be removed from the carousel."
            : "This best-seller poster will be removed."
        }
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminMedia;



