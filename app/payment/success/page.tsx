import { Card } from "@/components/ui/card";
import React from "react";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SuccessRoute = () => {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <Check className="w-12 h-12 rounded-full bg-green-500/30 text-green-500 p-2" />
          </div>
          <div className="mt-3 text-center sm:mt-5 w-full">
            <h3 className="text-lg leading-6 font-medium">
              Paymet Successfull
            </h3>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Congratss on your subscription please check your email for
                forther instruction
              </p>
            </div>
            <div className="mt-3 sm:mt-6 w-full">
              <Button className="w-full" asChild>
                <Link href="/dashboard">Go back to Dashboard </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuccessRoute;
