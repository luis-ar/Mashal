import React from "react";
import { ReactNode } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import DashboardNav from "../components/DashboardNav";
import { redirect } from "next/navigation";
import prisma from "../lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { stripe } from "../lib/stripe";

async function getData({
  email,
  id,
  firstName,
  lastName,
  profileImage,
}: {
  email: string;
  id: string;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  profileImage: string | undefined | null;
}) {
  noStore();
  let user;
  if (id !== undefined) {
    user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });
    console.log("desde:", user);
  }

  if (!user) {
    const name = `${firstName ?? ""} ${lastName ?? ""}`;
    console.log("creado user");
    await prisma.user.create({
      data: {
        id: id,
        email: email,
        name: name,
      },
    });
  }
  if (!user?.stripeCustomerId) {
    const data = await stripe.customers.create({
      email: email,
    });

    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        stripeCustomerId: data.id,
      },
    });
  }
}

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    return redirect("/");
  }
  await getData({
    email: user.email as string,
    firstName: user.given_name as string,
    id: user.id as string,
    lastName: user.family_name as string,
    profileImage: user.picture,
  });
  return (
    <div className="flex flex-col space-y-6 mt-10">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
