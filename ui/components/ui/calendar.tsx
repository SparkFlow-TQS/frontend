"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  selected,
  onSelect,
  inline,
  ...props
}: {
  className?: string
  selected?: Date
  onSelect?: (date: Date | null, event?: React.SyntheticEvent<any, Event>) => void
  inline?: boolean
}) {
  return (
    <DatePicker
      selected={selected}
      onChange={(date, event) => onSelect?.(date, event)}
      inline={inline}
      className={cn("", className)}
      calendarClassName="bg-white rounded-lg shadow-lg p-4"
      {...props}
    />
  )
}

export { Calendar }
