"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  selected,
  onSelect,
  ...props
}: {
  className?: string
  selected?: Date
  onSelect?: (date: Date | null) => void
}) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null
    onSelect?.(date)
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="date"
        value={selected?.toISOString().split('T')[0] || ''}
        onChange={handleDateChange}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        {...props}
      />
    </div>
  )
}

export { Calendar }
