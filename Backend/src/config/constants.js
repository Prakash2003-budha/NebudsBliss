import { config } from "dotenv";
config();

const CloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   
    api_key: process.env.CLOUDINARY_API_KEY,         
    api_secret: process.env.CLOUDINARY_API_SECRET    
};
export default CloudinaryConfig;

export const DBConfig = {
    mongodbUrl: process.env.MONGODB_URL,
    dbName: process.env.MONGO_DB_NAME || "NebudsBliss"
};

export const UserRole = {
    ADMIN: "Admin",
    Employee: "Employee",
    CUSTOMER: "Customer"
};

export const Gender = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other"
};

// Updated Category object
export const Category = {
    // Your original categories
    FAN: 'Fan',
    EARBUDS: 'Earbuds', 
    POWERBANK: 'PowerBank',
    COOKIE: 'Cookie',
    DRINKS: 'Drinks',
    // Added standard e-commerce categories
    ELECTRONICS: 'Electronics',
    CLOTHING: 'Clothing',
    HOME: 'Home & Kitchen',
    SPORTS: 'Sports',
    BOOKS: 'Books'
};

export const AppConfig = {   
    frontend_Url: process.env.FRONTEND_URL,
    backend_Url: process.env.BACKEND_URL,
    jwtSecret: process.env.JWT_SECRET
};

export const SMTPConfig = {
    fromAddress: process.env.SMTP_FROM,
    provider: process.env.SMTP_PROVIDER,
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    port: process.env.SMTP_PORT
};