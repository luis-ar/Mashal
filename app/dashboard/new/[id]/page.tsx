import Submitbuttons from "@/app/components/Submitbuttons";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

async function getData({ userId, noteId }: { userId: string; noteId: string }) {
  const data = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId: userId,
    },
    select: {
      title: true,
      description: true,
      id: true,
    },
  });
  return data;
}
const DynaminRoute = async ({ params }: { params: { id: string } }) => {
  noStore;
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({
    userId: user?.id as string,
    noteId: params?.id,
  });

  async function postData(formData: FormData) {
    "use server";
    if (!user) {
      throw new Error("you are not allowed");
    }
    const title = formData.get("title") as string;
    const descripcion = formData.get("description") as string;
    await prisma.note.update({
      where: {
        id: data?.id,
        userId: user.id,
      },
      data: {
        description: descripcion,
        title: title,
      },
    });
    revalidatePath("/dashboard");
    return redirect("/dashboard");
  }
  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
          <CardDescription>Rigth here you can now edit notes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type="text"
              name="title"
              placeholder="Title for your note"
              defaultValue={data?.title}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <textarea
              name="description"
              placeholder="Describe your note as you want"
              required
              defaultValue={data?.description}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between ">
          <Button asChild variant="destructive">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Submitbuttons />
        </CardFooter>
      </form>
    </Card>
  );
};

export default DynaminRoute;
