import { cn } from "@/lib/utils";

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

export function MaxWidthWrapper({
  className,
  children,
}: MaxWidthWrapperProps) {
  return (
    <div className="flex justify-center w-full">
      <div className={cn("max-w-[1200px] w-full px-4", className)}>
        {children}
      </div>
    </div>
  );
} 