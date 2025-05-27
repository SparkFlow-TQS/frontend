"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"

type CalendarProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

function Calendar({ className, selected, onSelect }: CalendarProps) {
  return (
    <div className={cn("relative", className)}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        showOutsideDays
        weekStartsOn={0}
        modifiersClassNames={{
          selected: "bg-blue-600 text-white rounded-full",
          today: "border border-blue-600",
        }}
        className="rounded-lg shadow px-4 py-2"
      />
    </div>
  )
}

export { Calendar }
