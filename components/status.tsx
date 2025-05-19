"use client";

import { useEffect } from "react";

import { copy } from "@/lib/constants/copy";
import { toast } from "@/lib/ui/toast";

interface StatusDisplayProps {
  status: string;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  useEffect(() => {
    if (status.startsWith("Error")) {
      toast.error(copy.errors.genericTitle, {
        description: status,
        duration: 3000,
      });
    } else if (status.startsWith("Session established")) {
      toast.success(copy.status.sessionEstablishedTitle, {
        description: status,
        duration: 5000,
      });
    } else {
      toast.info(copy.status.togglingAssistantTitle, {
        description: status,
        duration: 3000,
      });
    }
  }, [status]);

  return null;
}
