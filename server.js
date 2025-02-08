const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const adminRoute = require("./routes/admin");
const cartRoutes = require("./routes/cartRoutes");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
const corsOptions = {
  origin: [
    "https://itapelobeautystore.vercel.app",
    "http://localhost:3000",
    // Your deployed frontend domain
    "*", // Or allow all origins temporarily for testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS with options
app.use(cors(corsOptions));

// Important: Raw body parsing for Stripe webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stripe Payment Routes
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      // Verify your integration in this guide by including this parameter
      metadata: {
        integration_check: 'accept_a_payment',
        order_items: JSON.stringify(items)
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook handler
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      console.log('Payment succeeded:', paymentIntent.id);
      // You can add your logic here (e.g., update order status, send confirmation email)
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;

    case 'charge.succeeded':
      const charge = event.data.object;
      console.log('Charge succeeded:', charge.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Existing Routes
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
