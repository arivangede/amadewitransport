import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth";
import unitRoutes from "./routes/unit";
import packageRoutes from "./routes/package";
import promotionRoutes from "./routes/promotion";
import userRoutes from "./routes/user";
import visitorRoutes from "./routes/visitor";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Amadewi Trans API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/unit", unitRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/promotion", promotionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/track-visitor", visitorRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
