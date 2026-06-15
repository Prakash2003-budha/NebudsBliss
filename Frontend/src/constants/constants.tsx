export const FRONTEND_URL = 'http://localhost:5173';
export const BACKEND_URL = 'http://localhost:9005';

export const API_ENDPOINTS = {
    // Auth Endpoints
    LOGIN: `${BACKEND_URL}/auth/login`,
    REGISTER: `${BACKEND_URL}/auth/register`,
    FORGETPASSWORD: `${BACKEND_URL}/auth/forgot_password`,
    RESETPASSWORD: `${BACKEND_URL}/auth/reset-password`,

    VERIFY_PASSWORD: `${BACKEND_URL}/auth/verify-password`,

    GET_ALL_ITEMS: `${BACKEND_URL}/items`,          
    CREATE_ITEM: `${BACKEND_URL}/items`,            
    GET_ITEM_DETAIL: (id: string) => `${BACKEND_URL}/items/${id}`, 
    UPDATE_ITEM: (id: string) => `${BACKEND_URL}/items/${id}`,    
    DELETE_ITEM: (id: string) => `${BACKEND_URL}/items/${id}`,   
};

export const CATEGORY = {
  POWERBANK: 'Powerbank',
  CAMERA: 'Camera',
  EARBUDS: 'Earbuds',
  CHARGER: 'Charger',
  FAN: 'Fan'
};

export const MAPURL = {
  MAP: "https://maps.app.goo.gl/G4nqojV28Hzs28sZ7",
  LOCATION: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113710.36505478626!2d84.79043776816133!3d27.047574747691883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39935446b21c98cb%3A0x42938e30ff4f6cb5!2sBirgunj!5e0!3m2!1sen!2snp!4v1780556729250!5m2!1sen!2snp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
};