import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative h-14 w-[240px]", className)}>
      <Image
        src="/westerfood-logo.svg"
        alt="WesterFood Alimentacion"
        fill
        priority={priority}
        className="object-contain object-left"
        sizes="(max-width: 768px) 200px, 240px"
      />
    </div>
  );
}
