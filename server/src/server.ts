import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import couponRoutes from "./routes/couponRoutes";
import settingsRoutes from "./routes/settingRoutes";
import cartRoutes from "./routes/cartRoutes";
import addressRoutes from "./routes/addressRoutes";
import orderRoutes from "./routes/orderRoutes";

//load all your enviroment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://mern-ecommerce-deploy-to-render-11.onrender.com', 'http://localhost:3000'];
console.log('Server starting...');
console.log('Allowed origins:', allowedOrigins);
console.log('NODE_ENV:', process.env.NODE_ENV);
// Single CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('Request from origin:', origin);
    
    // Allow requests with no origin (like Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('BLOCKED origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));


app.use(express.json());
app.use(cookieParser());

export const prisma = new PrismaClient();

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("Hello from E-Commerce backend");
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
  console.log(`Allowed origins:`, allowedOrigins);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
