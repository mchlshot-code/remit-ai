import { cn } from "@/lib/utils"
import Image from "next/image"

interface FlagProps {
  countryCode: string  // e.g. "gb", "ng", "us"
  size?: number        // default 20
  className?: string
}

export function Flag({ countryCode, size = 20, className }: FlagProps) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={countryCode.toUpperCase()}
      className={cn("inline-block rounded-sm object-cover", className)}
    />
  )
}
