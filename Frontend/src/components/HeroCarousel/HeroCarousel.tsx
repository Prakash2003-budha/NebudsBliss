import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./HeroCarousel..module.scss";
import { API_ENDPOINTS } from "../../constants/constants";
import { compressImage } from "../../utils/imageCompression";

interface HeroSlide {
  _id: string;
  imageUrl: string;
  optimizeUrl: string;
  order: number;
}

interface HeroCarouselProps {
  isAdmin: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const MAX_SLIDES = 6;
const AUTOPLAY_MS = 6000;

const HeroCarousel: React.FC<HeroCarouselProps> = ({ isAdmin, onLoginClick, onRegisterClick }) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX: Adjust activeIndex during render if it goes out of bounds.
  // This replaces the old useEffect and prevents cascading re-renders.
  if (slides.length > 0 && activeIndex > slides.length - 1) {
    setActiveIndex(slides.length - 1);
  }

  const fetchSlides = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_HERO_SLIDES);
      setSlides(res.data.data || []);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Autoplay through slides.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    if (slides.length === 0) return;
    setActiveIndex(((index % slides.length) + slides.length) % slides.length);
  };

  const goDirection = (direction: "left" | "right") => {
    if (slides.length === 0) return;
    goTo(activeIndex + (direction === "left" ? -1 : 1));
  };

  const authHeaders = () => {
    const accessToken = localStorage.getItem("accessToken");
    return { Authorization: accessToken ? `Bearer ${accessToken}` : "" };
  };

  const handleAddSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (slides.length >= MAX_SLIDES) {
      toast.error(`You can only have up to ${MAX_SLIDES} slides.`);
      return;
    }
    const formData = new FormData();
    formData.append("image", await compressImage(file, { maxDimension: 1920, quality: 0.82 }));
    try {
      setBusy(true);
      const res = await axios.post(API_ENDPOINTS.CREATE_HERO_SLIDE, formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        withCredentials: true,
      });
      const newSlide: HeroSlide = res.data.data;
      setSlides((prev) => [...prev, newSlide]);
      setActiveIndex(slides.length); // jump to the new slide
      toast.success("Slide added successfully.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to add slide.");
    } finally {
      setBusy(false);
    }
  };

  const handleReplaceCurrent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const active = slides[activeIndex];
    if (!active) return;
    const formData = new FormData();
    formData.append("image", await compressImage(file, { maxDimension: 1920, quality: 0.82 }));
    try {
      setBusy(true);
      const res = await axios.put(API_ENDPOINTS.UPDATE_HERO_SLIDE(active._id), formData, {
        headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        withCredentials: true,
      });
      const updated: HeroSlide = res.data.data;
      setSlides((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      toast.success("Slide updated successfully.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to update slide.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveCurrent = async () => {
    const active = slides[activeIndex];
    if (!active) return;
    try {
      setBusy(true);
      await axios.delete(API_ENDPOINTS.DELETE_HERO_SLIDE(active._id), {
        headers: authHeaders(),
        withCredentials: true,
      });
      setSlides((prev) => prev.filter((s) => s._id !== active._id));
      toast.success("Slide removed.");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(message || "Failed to remove slide.");
    } finally {
      setBusy(false);
    }
  };

  const activeSlide = slides[activeIndex];

  if (loading) {
    return <section className={styles.carouselSection} />;
  }

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselSlide}>
          {activeSlide ? (
            <img
              key={activeSlide._id}
              src={activeSlide.optimizeUrl || activeSlide.imageUrl}
              alt="Store Poster"
              className={styles.posterImage}
            />
          ) : (
            <div className={styles.heroContent}>
              <h1>Ultima Boom Sleek</h1>
              <p>More Than Sound</p>
              <div className={styles.btnGroup}>
                <button className={styles.heroBtn} onClick={onLoginClick}>
                  Login / Shop Now
                </button>
                <button className={styles.heroBtn} onClick={onRegisterClick}>
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows — available to every visitor */}
      {slides.length > 1 && (
        <>
          <button className={`${styles.navBtn} ${styles.leftBtn}`} onClick={() => goDirection("left")}>
            &#10094;
          </button>
          <button className={`${styles.navBtn} ${styles.rightBtn}`} onClick={() => goDirection("right")}>
            &#10095;
          </button>
        </>
      )}

      {/* Pagination Dots — click one to swap to that slide, available to every visitor */}
      {slides.length > 1 && (
        <div className={styles.pagination}>
          {slides.map((slide, i) => (
            <span
              key={slide._id}
              className={`${styles.dot} ${i === activeIndex ? styles.active : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goTo(i);
              }}
            />
          ))}
        </div>
      )}

      {/* Admin Controls — add/replace/remove only, never gates swapping above */}
      {isAdmin && (
        <div className={styles.adminControls}>
          <input
            type="file"
            accept="image/*"
            ref={addInputRef}
            style={{ display: "none" }}
            onChange={handleAddSlide}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleReplaceCurrent}
          />

          {slides.length < MAX_SLIDES && (
            <button className={styles.addBtn} onClick={() => addInputRef.current?.click()} disabled={busy}>
              ➕ Add Slide
            </button>
          )}
          <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={busy}>
            {activeSlide ? "🔄 Replace" : "📤 Upload"}
          </button>
          {activeSlide && (
            <button className={styles.deleteBtn} onClick={handleRemoveCurrent} disabled={busy}>
              🗑 Remove
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;