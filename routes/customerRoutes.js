console.log("✅ customerRoutes loaded");
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

// Create or fetch customer
router.post("/customers", async (req, res) => {
  try {
    const { name, phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = await Customer.create({ name, phone });
    }

    res.send(customer);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Add points based on purchase amount
router.post("/add-points", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const points = Math.floor(amount / 50); // 1 point = ₹100

    const customer = await Customer.findOneAndUpdate(
      { phone },
      { $inc: { points: points } },
      { new: true, upsert: true }
    );

    await Transaction.create({ phone, type: "earn", amount, points });
    res.send(customer);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Redeem points
router.post("/redeem", async (req, res) => {
  try {
    const { phone, points } = req.body;
    const customer = await Customer.findOne({ phone });

    if (!customer) return res.status(404).send("Customer not found");
    if (customer.points < points)
      return res.status(400).send("Not enough points");

    customer.points -= points;
    await customer.save();

    await Transaction.create({ phone, type: "redeem", points });
    res.send(customer);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Get customer details
router.get("/customer/:phone", async (req, res) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  res.send(customer || {});
});

module.exports = router;

// 📊 Admin summary
// 📊 Enhanced Admin Summary
router.get("/summary", async (req, res) => {
  try {
    // Fetch all customers sorted by highest points    
    const customers = await Customer.find({ points: { $gt: 0 } }).sort({ points: -1 });

    const totalCustomers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);

    // Mock total purchase if you have a purchase field, else compute points * some factor
    const enriched = customers.map((c) => ({
      name: c.name,
      phone: c.phone,
      points: c.points || 0,
      totalPurchase: (c.points || 0) * 50, // Example: 1 point = ₹10 spent
    }));

    res.json({
      totalCustomers,
      totalPoints,
      customers: enriched,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
