/**
 * Price helpers shared across the storefront.
 *
 * The whole codebase uses the pattern `discountPrice ?? price` in many places.
 * That is only safe when discountPrice is either undefined/null or a valid,
 * lower "sale" price. A stored `0` (or any falsy value) would otherwise make
 * the item appear free. These helpers centralize the rule: a discount only
 * counts when it is a positive number strictly below the base price.
 */

export const isValidDiscount = (price: number, discountPrice?: number): boolean =>
  typeof discountPrice === "number" && discountPrice > 0 && discountPrice < price;

/** The price the customer actually pays for one unit. */
export const effectivePrice = (price: number, discountPrice?: number): number =>
  isValidDiscount(price, discountPrice) ? (discountPrice as number) : price;

/** The discount price to store on a cart item (undefined = no discount). */
export const cartDiscountPrice = (price: number, discountPrice?: number): number | undefined =>
  isValidDiscount(price, discountPrice) ? discountPrice : undefined;
