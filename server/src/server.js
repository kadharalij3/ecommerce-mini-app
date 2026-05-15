import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
);

app.options("*", cors());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Phone", category: "Electronics", price: 699 },
    { id: 2, name: "Shoes", category: "Fashion", price: 89 },
  ]);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
