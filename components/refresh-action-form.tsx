"use client";

import { useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/components/toast-host";

type RefreshActionFormProps = Omit<ComponentPropsWithoutRef<"form">, "action"> & {
  action: (formData: FormData) => Promise<void>;
  successMessage?: string;
};

export function RefreshActionForm({ action, successMessage = "Changes saved", className, ...props }: RefreshActionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await action(formData);
      notify(successMessage);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return <form {...props} className={`${className ?? ""}${isSubmitting ? " is-submitting" : ""}`} action={refreshAction} />;
}
