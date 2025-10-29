"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { getAuthUser, isAuthenticated } from "@/services/auth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PartyPopper, Cake } from "lucide-react"

// Helper function to parse birthday date from yyyy-mm-dd format only
// Strictly supports only yyyy-mm-dd format to avoid issues
function parseBirthdayDate(dateString: string): Date | null {
    console.log('[CONFETTI] parseBirthdayDate called with:', dateString)

    if (!dateString) {
        console.log('[CONFETTI] parseBirthdayDate: No date string provided')
        return null
    }

    // Trim whitespace
    const trimmedDate = String(dateString).trim()
    console.log('[CONFETTI] parseBirthdayDate: Trimmed date:', trimmedDate)

    if (!trimmedDate) {
        console.log('[CONFETTI] parseBirthdayDate: Empty after trimming')
        return null
    }

    // Strictly validate yyyy-mm-dd format only (no ISO with time, no other formats)
    const formatTest = /^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)
    console.log('[CONFETTI] parseBirthdayDate: Format test result:', formatTest)

    if (!formatTest) {
        console.warn(`[CONFETTI] parseBirthdayDate: Birthday date must be in yyyy-mm-dd format (e.g., 2001-10-29). Received: ${dateString}`)
        return null
    }

    // Parse as local date (to match the user's timezone)
    const [year, month, day] = trimmedDate.split('-').map(Number)
    console.log('[CONFETTI] parseBirthdayDate: Parsed components - year:', year, 'month:', month, 'day:', day)

    // Validate date components (we only care about month and day for comparison, but year must be reasonable for parsing)
    // Allow years from 1900 to 2100 (just to ensure it's a valid year, but we don't compare it)
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn(`[CONFETTI] parseBirthdayDate: Invalid date components: ${year}-${month}-${day}`)
        return null
    }

    const date = new Date(year, month - 1, day)
    console.log('[CONFETTI] parseBirthdayDate: Created date object:', date)
    console.log('[CONFETTI] parseBirthdayDate: Date.getTime():', date.getTime())
    console.log('[CONFETTI] parseBirthdayDate: isNaN(getTime()):', isNaN(date.getTime()))

    // Verify the date is valid (catches invalid dates like Feb 30)
    const isValid = !isNaN(date.getTime()) && date.getMonth() === month - 1 && date.getDate() === day
    console.log('[CONFETTI] parseBirthdayDate: Date validity check:', isValid)
    console.log('[CONFETTI] parseBirthdayDate: Expected month:', month - 1, 'got:', date.getMonth())
    console.log('[CONFETTI] parseBirthdayDate: Expected day:', day, 'got:', date.getDate())

    if (!isValid) {
        console.warn(`[CONFETTI] parseBirthdayDate: Could not parse birthday date: ${dateString}`)
        return null
    }

    console.log('[CONFETTI] parseBirthdayDate: Successfully parsed date:', date)
    return date
}

// Helper function to check if birthday celebration was already shown today
function hasBirthdayBeenCelebratedToday(userId: string): boolean {
    if (typeof window === "undefined") return false

    const today = new Date().toDateString()
    const storageKey = `birthday_celebration_${userId}_${today}`
    const hasCelebrated = localStorage.getItem(storageKey)

    console.log('[CONFETTI] hasBirthdayBeenCelebratedToday:', {
        userId,
        today,
        storageKey,
        hasCelebrated,
        result: hasCelebrated === "true"
    })

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
            console.log('[CONFETTI] triggerConfetti called')

            // Check if user is authenticated
            const isAuth = isAuthenticated()
            console.log('[CONFETTI] isAuthenticated:', isAuth)
            if (!isAuth) {
                console.log('[CONFETTI] User not authenticated, skipping')
                return
            }

            // Get user data
            const user = getAuthUser()
            console.log('[CONFETTI] User data:', user)
            console.log('[CONFETTI] User ID:', user?.id)
            console.log('[CONFETTI] User dateOfBirth:', user?.dateOfBirth)
            console.log('[CONFETTI] User date_of_birth:', user?.date_of_birth)

            if (!user) {
                console.log('[CONFETTI] No user data found, skipping')
                return
            }

            if (!user.id) {
                console.log('[CONFETTI] No user ID found, skipping')
                return
            }

            // Check if birthday celebration was already shown today
            const hasCelebrated = hasBirthdayBeenCelebratedToday(user.id)
            console.log('[CONFETTI] Has birthday been celebrated today:', hasCelebrated)
            if (hasCelebrated) {
                console.log('[CONFETTI] Birthday already celebrated today, skipping')
                return
            }

            // BIRTHDAY CONDITION - Check if today is the user's birthday
            const today = new Date()
            console.log('[CONFETTI] Today:', today.toDateString())
            console.log('[CONFETTI] Today month:', today.getMonth(), 'day:', today.getDate())

            // Handle both dateOfBirth and date_of_birth properties
            const birthdayString = user.dateOfBirth || user.date_of_birth
            console.log('[CONFETTI] Birthday string:', birthdayString)

            const userBirthday = birthdayString ? parseBirthdayDate(birthdayString) : null
            console.log('[CONFETTI] Parsed birthday date:', userBirthday)

            if (!userBirthday) {
                console.log('[CONFETTI] Could not parse birthday date, skipping')
                return
            }

            console.log('[CONFETTI] Birthday month:', userBirthday.getMonth(), 'day:', userBirthday.getDate())

            // Check if today is the user's birthday (ONLY compare month and day, ignore year and weekday)
            // Both dates are in local timezone, so comparison is accurate
            const todayMonth = today.getMonth()
            const todayDay = today.getDate()
            const birthdayMonth = userBirthday.getMonth()
            const birthdayDay = userBirthday.getDate()

            const isBirthday = todayMonth === birthdayMonth && todayDay === birthdayDay

            console.log('[CONFETTI] Comparing only MM-DD (ignoring year and weekday):')
            console.log('[CONFETTI] Today: month=' + todayMonth + ', day=' + todayDay)
            console.log('[CONFETTI] Birthday: month=' + birthdayMonth + ', day=' + birthdayDay)
            console.log('[CONFETTI] Is birthday match?', isBirthday)
            console.log('[CONFETTI] Month match:', todayMonth === birthdayMonth, `(${todayMonth} === ${birthdayMonth})`)
            console.log('[CONFETTI] Day match:', todayDay === birthdayDay, `(${todayDay} === ${birthdayDay})`)

            if (!isBirthday) {
                console.log('[CONFETTI] Today is not user birthday, skipping')
                return
            }

            console.log('[CONFETTI] ✅ BIRTHDAY MATCHED! Triggering confetti...')



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

        // Trigger confetti immediately on app load (if user is already authenticated)
        console.log('[CONFETTI] Component mounted, triggering on load')
        triggerConfetti()

        // Listen for user data updates after login (when user data is stored)
        const handleUserDataUpdated = () => {
            console.log('[CONFETTI] userDataUpdated event received')
            // Small delay to ensure user data is fully available in localStorage
            setTimeout(() => {
                console.log('[CONFETTI] Triggering after userDataUpdated event')
                triggerConfetti()
            }, 100)
        }
        window.addEventListener('userDataUpdated', handleUserDataUpdated)

        // Listen for storage changes (e.g., login in another tab)
        const handleStorage = (e: StorageEvent) => {
            console.log('[CONFETTI] Storage event received:', e.key)
            if (e.key === 'user' || e.key === 'token') {
                // Small delay to ensure user data is fully available
                setTimeout(() => {
                    console.log('[CONFETTI] Triggering after storage change')
                    triggerConfetti()
                }, 100)
            }
        }
        window.addEventListener('storage', handleStorage)

        // Optional: You can also trigger confetti on window focus for testing
        const handleFocus = () => {
            // Uncomment the line below if you want confetti on window focus too
            // triggerConfetti()
        }
        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('userDataUpdated', handleUserDataUpdated)
            window.removeEventListener('storage', handleStorage)
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