require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));

// Use express.raw for the webhook to ensure the signature can be verified
app.post('/api/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Payment successful for session: ${session.id}`);
      
      // Retrieve user email and purchased item details from the session
      const userEmail = session.client_reference_id;
      const lineItems = session.line_items; // Requires expanding line_items on session creation

      // In a real application, you would now update the user's credit balance in your database.
      // For example:
      // const creditsToAdd = getCreditsForPriceId(lineItems.data[0].price.id);
      // await updateUserCredits(userEmail, creditsToAdd);

      console.log(`User to credit: ${userEmail}`);
      console.log(`Purchase details:`, lineItems);
      console.log(`TODO: Implement database logic to add credits to user ${userEmail}.`);

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userEmail } = req.body;

  if (!priceId || !userEmail) {
    return res.status(400).send({ error: 'priceId and userEmail are required.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      // The client_reference_id is used to identify the user in the webhook
      client_reference_id: userEmail,
      success_url: `${process.env.CLIENT_URL}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}?payment=canceled`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).send({ error: 'Failed to create checkout session.' });
  }
});


const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
