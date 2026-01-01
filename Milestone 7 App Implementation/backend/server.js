// Import necessary modules
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const helmet = require('helmet');
const path = require('path');

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use your secret key

// Import routes
const UserRoutes = require('./routes/users');
const AuthRoutes = require('./routes/auth');
const SchoolDonationRoutes = require('./routes/schooldonations');
const ElderDonationRoutes = require('./routes/elderDonations');
const foodRoutes = require('./routes/foodRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const FoodSubmissionRoutes = require('./routes/FoodSubmissionRoutes');

// Import the subscriptions route
const SubscriptionRoutes = require('./routes/subscriptions');


// Connect to database
connection();

// Middleware setup
app.use(express.json());

app.use(cors({
    origin: '*', // Allow all origins (for development; be specific in production)
}));
// Middleware to serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(helmet());

// Test route
app.get('/', (req, res) => {
    res.send('Hi From Hunger Busters API v1 \n;]');
});

// Routes
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/school-donations', SchoolDonationRoutes);
app.use('/api/v1/elder-donations', ElderDonationRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/fsr',FoodSubmissionRoutes);
app.use('/api/recipes', recipeRoutes);

//please add a space before adding route to avoid conflict
// Add the new subscriptions route
app.use('/api/v1/user', SubscriptionRoutes); // Route for user subscriptions


// Create Stripe customer and subscription
app.post('/create-subscription', async (req, res) => {
  const { email, priceId } = req.body;

  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer if one doesn't exist
      customer = await stripe.customers.create({
        email,
      });
    }

    // Create the subscription and expand the latest_invoice and payment_intent
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Ensure we have a valid payment intent client secret
    if (!subscription.latest_invoice?.payment_intent?.client_secret) {
      throw new Error('Failed to retrieve payment intent client secret');
    }

    // Send the client_secret to the frontend
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});


// Define the port for the server to listen on
const port = process.env.PORT || 3543;

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}...`));

// Export the Express app
module.exports = app;
