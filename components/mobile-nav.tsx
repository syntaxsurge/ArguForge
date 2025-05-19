"use client";

import Link from "next/link";
import { useState } from "react";

import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/config/site";

import { Badge } from "./ui/badge";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex gap-2 w-full items-center overflow-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Open navigation">
            <MenuIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] rounded-lg flex flex-col flex-1 justify-start items-start overflow-y-auto p-6">
          <DialogHeader className="w-full">
            <DialogTitle className="w-full text-left text-2xl font-bold">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-2xl"
              >
                {siteConfig.name}
                <Badge variant="outline" className="text-normal">
                  Preview
                </Badge>
              </Link>
            </DialogTitle>
          </DialogHeader>
          <h1 className="mt-6 text-xl font-bold">{siteConfig.name}</h1>
          <p className="mt-2 text-muted-foreground text-start text-lg">
            This is a project that aims to demonstrate how to use OpenAI
            Realtime API with WebRTC in a modern Next 15 project. It has
            shadcn/ui components already installed and the WebRTC audio session
            hook already implemented. Clone the project and define your own
            tools.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
