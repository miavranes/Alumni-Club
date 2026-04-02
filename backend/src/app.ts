import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import alumniRoutes from "./routes/alumni.routes";
import healthRoutes from "./routes/health.routes";
import adminRoutes from "./routes/admin.routes";
import messageRoutes from "./routes/messages.routes";
import userRoutes from "./routes/users.routes";
import postsRoutes from "./routes/posts.routes";
import enrollRoutes from "./routes/enroll.routes";
import eventsRoutes from "./routes/events.routes";
import contactRoutes from "./routes/contact.routes";
import adminInquiriesRoutes from "./routes/admin.inquiries.routes";
import thesesRoutes from "./routes/theses.routes";

import { getMyProfile, updateMyProfile } from "./controllers/users.controller";
import { authenticate } from "./middlewares/auth.middleware";

const app = express();
const uploadsRoot = path.join(__dirname, "..", "uploads");

/**
 * CORS CONFIGURATION
 * Allows:
 * - Render frontend
 * - Local development
 */
const allowedOrigins: (string | RegExp)[] = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://alumni-club.onrender.com",
  /^https:\/\/.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );

      if (allowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

app.use(express.json());

app.use("/uploads", express.static(uploadsRoot));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/inquiries", adminInquiriesRoutes);
app.use("/api/theses", thesesRoutes);

app.use("/api", postsRoutes);
app.use("/api", enrollRoutes);

app.get("/api/profile", authenticate, getMyProfile);
app.put("/api/profile", authenticate, updateMyProfile);


export default app;
