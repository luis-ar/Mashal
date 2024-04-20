import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const getStripeSeccion = async ({
  priceId,
  domainURL,
  customerId,
}: {
  priceId: string;
  domainURL: string;
  customerId: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    billing_address_collection: "auto",
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_types: ["card"],
    customer_update: {
      address: "auto",
      name: "auto",
    },
    success_url: `${domainURL}/payment/success`,
    cancel_url: `${domainURL}/payment/cancelled`,
  });
  return session.url as string; 
};
