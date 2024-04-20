import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getStripeSeccion, stripe } from "@/app/lib/stripe";
import { redirect } from "next/navigation";
import {
  StripePortal,
  StripeSubscriptionCreateButton,
} from "@/app/components/Submitbuttons";
import { unstable_noStore as noStore } from "next/cache";

const featureItems = [
  { name: "LOREM IPSUM SOMETHING" },
  { name: "LOREM IPSUM SOMETHING" },
  { name: "LOREM IPSUM SOMETHING" },
  { name: "LOREM IPSUM SOMETHING" },
  { name: "LOREM IPSUM SOMETHING" },
];
const getData = async (userId: string) => {
  noStore();
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });
  return data;
};

const BillingePage = async () => {
  const { getUser } = getKindeServerSession();
  //obtengo los datos del usuario
  const user = await getUser();
  const data = await getData(user?.id as string);
  async function createSubscription() {
    "use server";
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });
    if (!dbUser?.stripeCustomerId) {
      throw new Error("Unable to get customer id");
    }
    const subscriptionURL = await getStripeSeccion({
      customerId: dbUser.stripeCustomerId,
      domainURL: "http://localhost:3000",
      priceId: process.env.STRIPE_PRICE_ID as string,
    });
    return redirect(subscriptionURL);
  }

  async function createCustomerPortal() {
    "use server";
    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomerId as string,
      return_url: "http://localhost:3000/dashboard",
    });
    return redirect(session.url);
  }

  if (data?.status === "active") {
    return (
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl md:text-4xl">SubsCription</h1>
            <p className="text-lg text-muted-foreground">
              Settings reagding ypur Subscription
            </p>
          </div>
        </div>
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Edit Subscription</CardTitle>
            <CardDescription>
              Click on the button below, this will give you the opportunity to
              change your payment details and view your statement at the same
              time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomerPortal}>
              <StripePortal />
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card className="flex flex-col">
        <CardContent className="py-8">
          <div>
            <h1 className="inline-flex px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
              Monthy
            </h1>
          </div>
          <div className="mt-4 flex items-baseline text-8xl font-extrabold">
            $30 <span className="ml-1 text-2xl text-muted-foreground">/no</span>
          </div>
          <p className="mt-5 text-lg text-muted-foreground ">
            Write as many notes as you want for $30 a Month
          </p>
        </CardContent>
        <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-8 sm:p-10 sm:pt-6 ">
          <ul className="space-y-4">
            {featureItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <p className="ml-3 text-base">{item.name}</p>
              </li>
            ))}
          </ul>
          <form className="w-full" action={createSubscription}>
            <StripeSubscriptionCreateButton />
          </form>
        </div>
      </Card>
    </div>
  );
};

export default BillingePage;
