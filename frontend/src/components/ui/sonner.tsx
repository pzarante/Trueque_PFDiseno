"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-black group-[.toaster]:border-2 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-black dark:group-[.toaster]:text-white dark:group-[.toaster]:border-white dark:group-[.toaster]:border-2',
          description: 'group-[.toast]:text-black dark:group-[.toast]:text-white',
          actionButton: 'group-[.toast]:bg-black group-[.toast]:text-white dark:group-[.toast]:bg-white dark:group-[.toast]:text-black',
          cancelButton: 'group-[.toast]:bg-black/10 group-[.toast]:text-black dark:group-[.toast]:bg-white/10 dark:group-[.toast]:text-white',
          success: 'group-[.toaster]:!text-black dark:group-[.toaster]:!text-white',
          error: 'group-[.toaster]:!text-black dark:group-[.toaster]:!text-white',
          info: 'group-[.toaster]:!text-black dark:group-[.toaster]:!text-white',
          warning: 'group-[.toaster]:!text-black dark:group-[.toaster]:!text-white',
          icon: 'group-[.toast]:!text-black dark:group-[.toast]:!text-white',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
