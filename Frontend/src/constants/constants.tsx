
const getHost = (): string => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }
  return "localhost";
};

export const IpAddress = `http://${getHost()}`;

export const FRONTEND_URL = `${IpAddress}:5173`; 
export const BACKEND_URL = `${IpAddress}:9005`;


export const API_ENDPOINTS = {
    // Auth Endpoints
    LOGIN: `${BACKEND_URL}/auth/login`,
    REGISTER: `${BACKEND_URL}/auth/register`,
    FORGETPASSWORD: `${BACKEND_URL}/auth/forgot_password`,
    RESETPASSWORD: `${BACKEND_URL}/auth/reset-password`,
    VERIFY_PASSWORD: `${BACKEND_URL}/auth/verify-password`,
    MY_PROFILE: `${BACKEND_URL}/auth/me`,

    // Item Endpoints
    GET_ALL_ITEMS: `${BACKEND_URL}/items`,
    CREATE_ITEM: `${BACKEND_URL}/items`,
    GET_ITEM_DETAIL: (id: string) => `${BACKEND_URL}/items/${id}`,
    UPDATE_ITEM: (id: string) => `${BACKEND_URL}/items/${id}`,
    DELETE_ITEM: (id: string) => `${BACKEND_URL}/items/${id}`,

    // Poster Endpoints
    GET_POSTER: `${BACKEND_URL}/poster`,
    UPLOAD_POSTER: `${BACKEND_URL}/poster`,
    DELETE_POSTER: `${BACKEND_URL}/poster`,

    // Order Endpoints
    CREATE_ORDER: `${BACKEND_URL}/orders`,
    GET_ALL_ORDERS: `${BACKEND_URL}/orders`,
    GET_MY_ORDERS: `${BACKEND_URL}/orders/my`,
    GET_ORDER_DETAIL: (id: string) => `${BACKEND_URL}/orders/${id}`,
    UPDATE_ORDER: (id: string) => `${BACKEND_URL}/orders/${id}`,
    DELETE_ORDER: (id: string) => `${BACKEND_URL}/orders/${id}`,
};

// Maps the friendly URL slugs used in /category/:slug links (header, sidebar, footer)
// to the actual category values stored in the database.
export const CATEGORY_SLUG_MAP: Record<string, string> = {
    earbuds: "Earbuds",
    powerbanks: "PowerBank",
    cameras: "Camera",
    accessories: "Accessories",
    fans: "Fan",
};

export const CATEGORY = {
    POWERBANK: 'PowerBank',
    CAMERA: 'Camera',
    EARBUDS: 'Earbuds',
    ACCESSORIES: 'Accessories',
    FAN: 'Fan'
};

// Constants matching Backend Order Models
export const PAYMENT_METHOD = {
    CASH: 'cash',
    BANK: 'bank'
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
} as const;

export const ORDER_STATUS = {
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
} as const;

export const MAPURL = {
    MAP: "https://maps.app.goo.gl/G4nqojV28Hzs28sZ7",
    LOCATION: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113710.36505478626!2d84.79043776816133!3d27.047574747691883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39935446b21c98cb%3A0x42938e30ff4f6cb5!2sBirgunj!5e0!3m2!1sen!2snp!4v1780556729250!5m2!1sen!2snp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
};