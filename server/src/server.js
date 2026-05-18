import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

const normalizeOrigin = (value) =>
  typeof value === "string" ? value.trim().replace(/\/$/, "") : value;

const allowedOrigins = [process.env.FRONTEND_URL]
  .filter(Boolean)
  .map(normalizeOrigin);

console.log("Allowed CORS origins:", allowedOrigins.map((o) => JSON.stringify(o)));

app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("CORS blocked", {
        rawOrigin: JSON.stringify(origin),
        normalizedOrigin: JSON.stringify(normalizedOrigin),
        allowedOrigins: allowedOrigins.map((o) => JSON.stringify(o)),
      });

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
