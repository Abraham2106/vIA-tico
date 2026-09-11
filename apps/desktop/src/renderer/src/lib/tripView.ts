import {
  effectiveVerdict,
  formatMoney,
  type Trip,
  type WorkspaceSnapshot,
} from '@viaticocero/core'

export const SELECTED_TRIP_KEY = 'viaticocero.selectedTripId'

export type TripViewStats = {
  trip: Trip
  receiptCount: number
  procedeCount: number
  reviewCount: number
  rejectedCount: number
  openExceptionCount: number
  travelerName?: string
}

export function tripFromSnapshot(snapshot: WorkspaceSnapshot, tripId?: string): Trip | undefined {
  if (tripId) {
    const match = snapshot.trips.find((item) => item.id === tripId)
    if (match) return match
  }
  return snapshot.trips.find((item) => item.status === 'open') ?? snapshot.trips[0]
}

export function statsForTrip(snapshot: WorkspaceSnapshot, trip: Trip): TripViewStats {
  const receipts = snapshot.receipts.filter((item) => item.tripId === trip.id)
  const traveler = snapshot.travelers.find((item) => item.id === trip.travelerId)
  return {
    trip,
    receiptCount: receipts.length,
    procedeCount: receipts.filter((item) => effectiveVerdict(item) === 'PROCEDE').length,
    reviewCount: receipts.filter((item) => effectiveVerdict(item) === 'REVISION').length,
    rejectedCount: receipts.filter((item) => effectiveVerdict(item) === 'NO_PROCEDE').length,
    openExceptionCount: snapshot.exceptions.filter(
      (item) => item.tripId === trip.id && item.status === 'open',
    ).length,
    travelerName: traveler?.name,
  }
}

export function tripPeriodLabel(trip: Trip, formatDate: (iso: string) => string): string {
  return `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
}

export function tripAdvanceLabel(trip: Trip): string {
  return formatMoney(trip.advance)
}

export function readStoredTripId(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined
  return sessionStorage.getItem(SELECTED_TRIP_KEY) || undefined
}

export function storeTripId(tripId: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SELECTED_TRIP_KEY, tripId)
}
