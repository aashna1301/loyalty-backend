console.log("🔹 Starting loyalty backend...");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔹 Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  console.log("📩 Received GET / request");
  res.send("Loyalty backend is running!");
});

app.use("/api", require("./routes/customerRoutes"));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
