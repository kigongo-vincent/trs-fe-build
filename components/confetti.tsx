"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { getAuthUser, isAuthenticated } from "@/services/auth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PartyPopper, Cake } from "lucide-react"

// Helper function to parse birthday date from various formats
function parseBirthdayDate(dateString: string): Date | null {
    if (!dateString) return null

    // Try different date formats
    const formats = [
        // YYYY-MM-DD (ISO format)
        /^\d{4}-\d{2}-\d{2}$/,
        // DD-MM-YYYY
        /^\d{2}-\d{2}-\d{4}$/,
        // MM/DD/YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/,
        // DD/MM/YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/,
        // MM-DD-YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/,
    ]

    try {
        // First try direct Date constructor (handles most formats)
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
            return date
        }

        // Handle specific formats manually
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
            // DD-MM-YYYY format
            const [day, month, year] = dateString.split('-')
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
            // Try MM/DD/YYYY first (US format)
            const parts = dateString.split('/')
            const month = parseInt(parts[0]) - 1
            const day = parseInt(parts[1])
            const year = parseInt(parts[2])

            // Validate the date
            const date = new Date(year, month, day)
            if (date.getMonth() === month && date.getDate() === day && date.getFullYear() === year) {
                return date
            }

            // If invalid, try DD/MM/YYYY (European format)
            const day2 = parseInt(parts[0])
            const month2 = parseInt(parts[1]) - 1
            const year2 = parseInt(parts[2])

            const date2 = new Date(year2, month2, day2)
            if (date2.getMonth() === month2 && date2.getDate() === day2 && date2.getFullYear() === year2) {
                return date2
            }
        }

        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
            // MM-DD-YYYY format
            const [month, day, year] = dateString.split('-')
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        console.warn(`Could not parse birthday date: ${dateString}`)
        return null
    } catch (error) {
        console.error(`Error parsing birthday date: ${dateString}`, error)
        return null
    }
}

// Helper function to check if birthday celebration was already shown today
function hasBirthdayBeenCelebratedToday(userId: string): boolean {
    if (typeof window === "undefined") return false

    const today = new Date().toDateString()
    const storageKey = `birthday_celebration_${userId}_${today}`
    const hasCelebrated = localStorage.getItem(storageKey)

    return hasCelebrated === "true"
}

// Helper function to mark birthday as celebrated today
function markBirthdayAsCelebratedToday(userId: string): void {
    if (typeof window === "undefined") return

    const today = new Date().toDateString()
    const storageKey = `birthday_celebration_${userId}_${today}`
    localStorage.setItem(storageKey, "true")

    // Clean up old entries (keep only last 30 days)
    cleanupOldBirthdayEntries()
}

// Helper function to clean up old birthday celebration entries
function cleanupOldBirthdayEntries(): void {
    if (typeof window === "undefined") return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('birthday_celebration_')) {
            try {
                const parts = key.split('_')
                const dateString = parts.slice(-1)[0] // Get the date part
                const entryDate = new Date(dateString)

                if (entryDate < thirtyDaysAgo) {
                    localStorage.removeItem(key)
                }
            } catch (error) {
                // If we can't parse the date, remove the entry
                localStorage.removeItem(key)
            }
        }
    })
}

export function Confetti() {
    const [showBirthdayAlert, setShowBirthdayAlert] = useState(false)
    const [username, setUsername] = useState("")

    useEffect(() => {
        // Only trigger confetti for logged-in users
        const triggerConfetti = () => {
            // Check if user is authenticated
            if (!isAuthenticated()) {
                console.log("User not authenticated, skipping birthday celebration")
                return
            }

            // Get user data
            const user = getAuthUser()
            console.log("User data:", user) // Debug log

            if (!user) {
                console.log("No user data found, skipping birthday celebration")
                return
            }

            // Check if birthday celebration was already shown today
            if (hasBirthdayBeenCelebratedToday(user.id)) {
                console.log("Birthday celebration already shown today for this user, skipping")
                return
            }

            // BIRTHDAY CONDITION - Add this check here
            const today = new Date()
            const userBirthday = user.dateOfBirth ? parseBirthdayDate(user.dateOfBirth) : null

            console.log("User birthday string:", user.dateOfBirth)
            console.log("Parsed birthday date:", userBirthday)

            if (!userBirthday) {
                console.log("No birthday data found for user, skipping birthday celebration")
                return
            }

            // Check if today is the user's birthday (month and day match)
            const isBirthday = today.getMonth() === userBirthday.getMonth() &&
                today.getDate() === userBirthday.getDate()

            console.log("Today's date:", today.toDateString())
            console.log("User's birthday:", userBirthday.toDateString())
            console.log("Is birthday today?", isBirthday)

            if (!isBirthday) {
                console.log("Today is not user's birthday, skipping birthday celebration")
                return
            }

            console.log("🎉 It's the user's birthday! Triggering celebration!")

            // Mark that we've celebrated this user's birthday today
            markBirthdayAsCelebratedToday(user.id)

            const userDisplayName = user?.fullName || user?.email || "User"
            setUsername(userDisplayName)

            // Show birthday message with username
            toast.success(`🎉 Happy Birthday, ${userDisplayName}! 🎂`, {
                duration: 4000,
                position: "top-center",
                style: {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                },
            })

            // Also show an alert for better visibility
            setShowBirthdayAlert(true)

            // Create a burst of confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Add some delayed confetti for a more festive effect
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                })
            }, 250)

            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                })
            }, 400)

            // Add more confetti bursts for extra celebration
            setTimeout(() => {
                confetti({
                    particleCount: 75,
                    spread: 90,
                    origin: { y: 0.8 }
                })
            }, 600)

            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 90,
                    spread: 45,
                    origin: { y: 0.4 }
                })
            }, 800)

            // Auto-hide the alert after 8 seconds
            setTimeout(() => {
                setShowBirthdayAlert(false)
            }, 4000)
        }

        // Trigger confetti immediately on load (only for authenticated users)
        triggerConfetti()

        // Optional: You can also trigger confetti on window focus for testing
        const handleFocus = () => {
            // Uncomment the line below if you want confetti on window focus too
            // triggerConfetti()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    if (!showBirthdayAlert) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-w-md">
                <Alert className="border-2 border-primary bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
                    <PartyPopper className="h-6 w-6 text-pink-600" />
                    <AlertDescription className="text-lg font-bold text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Cake className="h-8 w-8 text-pink-600" />
                            <span className="text-2xl">🎉</span>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Happy Birthday, {username}!
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            🎂 Wishing you a fantastic day! 🎈
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    )
} 