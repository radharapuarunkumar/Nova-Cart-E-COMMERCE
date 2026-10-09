const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(x => x.trim()) : true }));
app.use(express.json());

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  oldPrice: Number,
  rating: Number,
  image: String,
  description: String,
  stock: Number,
  badge: String
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: Number,
  status: { type: String, default: "Placed" }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

const demoProducts = [
  {
    name: "AeroBeat Pro Headphones",
    category: "Audio",
    price: 3499,
    oldPrice: 4999,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description: "Wireless over-ear headphones with deep bass and adaptive comfort.",
    stock: 18,
    badge: "Best Seller"
  },
  {
    name: "Nova X Smartwatch",
    category: "Wearables",
    price: 4299,
    oldPrice: 5999,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: "Fitness tracking, notifications and a bright edge-to-edge display.",
    stock: 12,
    badge: "Trending"
  },
  {
    name: "UrbanFlex Sneakers",
    category: "Fashion",
    price: 2899,
    oldPrice: 3999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description: "Everyday sneakers designed for comfort and street style.",
    stock: 25,
    badge: "New"
  },
  {
    name: "PixelGlow Desk Lamp",
    category: "Home",
    price: 1599,
    oldPrice: 2199,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    description: "Minimal smart desk lamp with adjustable brightness.",
    stock: 31,
    badge: "Hot Deal"
  },
  {
    name: "TerraPack Backpack",
    category: "Accessories",
    price: 1999,
    oldPrice: 2799,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Water-resistant backpack with laptop compartment.",
    stock: 16,
    badge: "Popular"
  },
  {
    name: "VividCam Mini",
    category: "Electronics",
    price: 7499,
    oldPrice: 8999,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    description: "Compact camera for travel, content and everyday memories.",
    stock: 8,
    badge: "Premium"
  }
];

app.get("/api/test", (req, res) => res.json({ success: true, message: "NovaCart API is running" }));

async function seedProducts() {
  if (await Product.countDocuments() === 0) {
    await Product.insertMany(demoProducts);
    console.log("Demo products inserted.");
  }
}

app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    res.json(await Product.find(filter).sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ message: "Could not load products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product id" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    if (!customer?.name || !customer?.email || !customer?.address || !items?.length) {
      return res.status(400).json({ message: "Please complete customer and cart details." });
    }
    const order = await Order.create({ customer, items, total });
    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      status: order.status
    });
  } catch {
    res.status(500).json({ message: "Could not place order" });
  }
});

app.get("/api/orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Could not load orders" });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/novacart")
  .then(async () => {
    await seedProducts();
    app.listen(PORT, () => console.log(`NovaCart running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });