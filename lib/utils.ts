import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num)
}

export const disasterTypes = [
  { value: "flood", label: "Flood" },
  { value: "earthquake", label: "Earthquake" },
  { value: "cyclone", label: "Cyclone" },
  { value: "landslide", label: "Landslide" },
  { value: "tsunami", label: "Tsunami" },
  { value: "drought", label: "Drought" },
  { value: "wildfire", label: "Wildfire" },
  { value: "other", label: "Other" },
]

export const severityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

export const resourceTypes = [
  { value: "food", label: "Food & Water" },
  { value: "medical", label: "Medical Supplies" },
  { value: "shelter", label: "Shelter" },
  { value: "clothing", label: "Clothing" },
  { value: "rescue", label: "Rescue Equipment" },
  { value: "volunteers", label: "Volunteers" },
  { value: "transport", label: "Transportation" },
  { value: "communication", label: "Communication Equipment" },
  { value: "other", label: "Other" },
]

export const userRoles = [
  { value: "admin", label: "Administrator" },
  { value: "government", label: "Government Official" },
  { value: "ngo", label: "NGO Representative" },
  { value: "volunteer", label: "Volunteer" },
  { value: "public", label: "Public User" },
]

