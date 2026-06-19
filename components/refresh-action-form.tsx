"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";

type RefreshActionFormProps = Omit<ComponentPropsWithoutRef<"form">, "action"> & {
  action: (formData: FormData) => Promise<void>;
};

export function RefreshActionForm({ action, ...props }: RefreshActionFormProps) {
  const router = useRouter();

  const refreshAction = async (formData: FormData) => {
    await action(formData);
    router.refresh();
  };

  return <form {...props} action={refreshAction} />;
}
