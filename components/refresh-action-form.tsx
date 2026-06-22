"use client";

import { useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/components/toast-host";

type RefreshActionFormProps = Omit<ComponentPropsWithoutRef<"form">, "action"> & {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  successMessage?: string;
};

export function RefreshActionForm({ action, successMessage = "Changes saved", className, ...props }: RefreshActionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await action(formData);
      if (result?.error) {
        notify(result.error, "error");
        return;
      }
      notify(successMessage);
      router.refresh();
    } catch (error) {
      // Re-throw redirect errors so Next.js can perform the navigation
      if (error instanceof Error && typeof (error as Error & { digest?: string }).digest === "string" && (error as Error & { digest?: string }).digest!.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      notify("An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <form {...props} className={`${className ?? ""}${isSubmitting ? " is-submitting" : ""}`} action={refreshAction} />;
}