import React, { useRef } from "react";
import styles from "./HeroCarousel..module.scss";

interface HeroCarouselProps {
  posterUrl: string | null;
  isAdmin: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  posterUrl,
  isAdmin,
  onUpload,
  onDelete,
  onLoginClick,
  onRegisterClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselContainer} ref={scrollRef}>
        <div className={styles.carouselSlide}>
          {posterUrl ? (
            <img src={posterUrl} alt="Store Poster" className={styles.posterImage} />
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

      {/* Navigation Arrows */}
      <button className={`${styles.navBtn} ${styles.leftBtn}`} onClick={() => scroll("left")}>
        &#10094;
      </button>
      <button className={`${styles.navBtn} ${styles.rightBtn}`} onClick={() => scroll("right")}>
        &#10095;
      </button>

      {/* Pagination Dots (Visual only for single slide, adapt when adding array) */}
      <div className={styles.pagination}>
        <span className={`${styles.dot} ${styles.active}`}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className={styles.adminControls}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onUpload}
          />
          <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
            {posterUrl ? "🔄 Replace" : "📤 Upload"}
          </button>
          {posterUrl && (
            <button className={styles.deleteBtn} onClick={onDelete}>
              🗑 Remove
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;