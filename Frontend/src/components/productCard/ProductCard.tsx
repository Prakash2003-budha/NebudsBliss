import React from "react";
// Reuses the homepage's existing card styles so every product grid in the app looks identical.
import styles from "../../pages/homePage/home.page.module.scss";
import profile from "../../img/icons/profile.black.png";

export interface Item {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: { url: string; optimizeUrl: string }[];
  category: string;
  isActive: boolean;
}

interface ProductCardProps {
  item: Item;
  isAdmin: boolean;
  deletingId: string | null;
  onOpenProduct: (item: Item) => void;
  onDeleteClick: (item: Item) => void;
  addToCart: (item: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
  }) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isAdmin,
  deletingId,
  onOpenProduct,
  onDeleteClick,
  addToCart,
}) => {
  const imageSrc =
    item.images && item.images.length > 0
      ? item.images[0].optimizeUrl || item.images[0].url
      : (profile as string);

  return (
    <div
      className={styles.productCard}
      onClick={() => onOpenProduct(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenProduct(item);
      }}
    >
      <div className={styles.categoryTabContainer}>
        <span className={styles.categoryTab}>{item.category}</span>
      </div>
      <div className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt={item.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = profile as string;
          }}
        />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.nameRow}>
          <h3>{item.name}</h3>
          <span className={styles.priceBadge}>
            Rs. {item.discountPrice ? item.discountPrice : item.price}
          </span>
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.cardActions}>
          <button
            className={styles.addToCartBtn}
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                _id: item._id,
                name: item.name,
                price: item.price,
                discountPrice: item.discountPrice,
                image: imageSrc,
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.cartIcon}
            >
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            Add To Cart
          </button>
          {isAdmin && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(item);
              }}
              disabled={deletingId === item._id}
            >
              {deletingId === item._id ? (
                "Deleting..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.deleteIcon}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
