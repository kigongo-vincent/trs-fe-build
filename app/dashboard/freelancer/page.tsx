"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar1,
    CalendarArrowDown,
    CalendarArrowUp,
    Plus
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { getAuthUser, getUserRole, isAuthenticated, isTokenExpired } from "@/services/auth"
import { MotionBlock } from "@/components/MotionBlock"

interface DashboardStats {
    totalCompanies: number
    totalProjects: number
    totalHours: number
    totalEarnings: number
    activeProjects: number
    completedProjects: number
    pendingInvoices: number
    hoursToday: number
    hoursWeek: number
    hoursMonth: number
    billableHours: number
}

interface RecentActivity {
    id: string
    type: 'project' | 'task' | 'invoice'
    title: string
    company: string
    amount?: number
    hours?: number
    status: 'completed' | 'pending' | 'in-progress'
    date: string
}

export default function FreelancerDashboard() {
    const [showAdd, setShowAdd] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalCompanies: 0,
        totalProjects: 0,
        totalHours: 0,
        totalEarnings: 0,
        activeProjects: 0,
        completedProjects: 0,
        pendingInvoices: 0,
        hoursToday: 0,
        hoursWeek: 0,
        hoursMonth: 0,
        billableHours: 0
    })

    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!isAuthenticated() || isTokenExpired()) {
                router.replace("/")
                return
            }
            const role = getUserRole()
            if (role !== "Freelancer") {
                switch (role) {
                    case "Super Admin":
                        router.replace("/dashboard/super-admin")
                        break
                    case "Company Admin":
                        router.replace("/dashboard/company-admin")
                        break
                    case "Board Member":
                        router.replace("/dashboard/company-admin")
                        break
                    case "Consultant":
                    case "Employee":
                        router.replace("/dashboard/employee")
                        break
                    default:
                        router.replace("/dashboard/freelancer")
                }
            }
        }
    }, [router])

    useEffect(() => {
        // Set hardcoded dashboard data
        setStats({
            totalCompanies: 3,
            totalProjects: 3,
            totalHours: 380,
            totalEarnings: 31640,
            activeProjects: 2,
            completedProjects: 1,
            pendingInvoices: 2,
            hoursToday: 6.5,
            hoursWeek: 32,
            hoursMonth: 120,
            billableHours: 110
        })

        setRecentActivity([
            {
                id: '1',
                type: 'invoice',
                title: 'Website Development',
                company: 'TechCorp Inc',
                amount: 9000,
                status: 'completed',
                date: new Date().toISOString().split('T')[0]
            },
            {
                id: '2',
                type: 'task',
                title: 'E-commerce Platform',
                company: 'RetailMax',
                hours: 8,
                status: 'in-progress',
                date: new Date().toISOString().split('T')[0]
            },
            {
                id: '3',
                type: 'project',
                title: 'Mobile App Design',
                company: 'DesignStudio',
                status: 'completed',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ])

        setLoading(false)
    }, [])

    const getPercentageIcon = (percentage: number, index?: number) => {
        if (percentage > 0) return <TrendingUp className={`h-4 w-4 ${index == 0 ? "" : "text-green-600"}`} />
        if (percentage < 0) return <TrendingDown className={`h-4 w-4 ${index == 0 ? "" : "text-red-600"}`} />
        return <Minus className="h-4 w-4 " />
    }

    const getPercentageColor = (percentage: number, index?: number) => {
        if (index == 0) {
            return ""
        }
        if (percentage > 0) return "text-green-600"
        if (percentage < 0) return "text-red-600"
        return ""
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'in-progress':
                return 'bg-blue-100 text-blue-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }


    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Hello</h1>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/dashboard/freelancer/time-logs/new">
                                <Clock className="mr-2 h-4 w-4" /> Log Time
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/freelancer/companies/new">
                                <Plus className="mr-2 h-4 w-4" /> Add Company
                            </Link>
                        </Button>
                    </div>
                </div>
                <Alert>
                    <AlertDescription>{error}. Please try refreshing the page.</AlertDescription>
                </Alert>
            </div>
        )
    }

    const user = getAuthUser()

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <MotionBlock delay={0}>
                <div className="flex md:h-[5vh] h-max items-center justify-between">
                    <div className="">
                        <h1 className="text tracking-tight">
                            Hello, <span className="font-semibold">{user?.lastName || user?.fullName?.split(' ')[1] || 'Freelancer'}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {showAdd && (
                            <MotionBlock delay={.1}>
                                <Button asChild className="gradient rounded-full">
                                    <Link href="/dashboard/freelancer/time-logs/new">
                                        <Clock size={25} className="h-10 w-10 rounded-full" /> Log Time
                                    </Link>
                                </Button>
                            </MotionBlock>
                        )}
                    </div>
                </div>
            </MotionBlock>

            {/* Dashboard Cards */}
            <MotionBlock delay={0.1}>
                <div className="text-white bg-paper p-8 rounded-lg grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => {
                        const dataMap = [
                            {
                                title: 'Hours Today',
                                icon: <Clock className="h-8 w-8 bg-white/40 text-white p-2 rounded backdrop-blur-sm" />,
                                value: Math.floor(stats.hoursToday),
                                percentage: 85,
                                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/005/210/247/non_2x/bright-abstract-background-orange-color-free-vector.jpg)]',
                            },
                            {
                                title: 'Hours This Week',
                                icon: <CalendarArrowDown className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                                value: Math.floor(stats.hoursWeek),
                                percentage: 78,
                                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/007/075/692/non_2x/abstract-white-fluid-wave-background-free-vector.jpg)]',
                            },
                            {
                                title: 'Hours This Month',
                                icon: <Calendar1 className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                                value: Math.floor(stats.hoursMonth),
                                percentage: 92,
                                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/003/127/955/non_2x/abstract-white-and-grey-background-with-dynamic-waves-shape-free-vector.jpg)]',
                            },
                            {
                                title: 'Total Earnings',
                                icon: <DollarSign className="h-8 w-8 bg-black/10 text-white p-2 rounded backdrop-blur-sm" />,
                                value: Math.floor(stats.totalEarnings / 1000),
                                percentage: 15,
                                bg: 'bg-[url(https://static.vecteezy.com/system/resources/previews/036/340/598/large_2x/abstract-grey-background-poster-with-dynamic-waves-vector.jpg)]',
                            },
                        ];

                        const card = dataMap[index];

                        return (
                            <MotionBlock key={index} delay={0.2 + index * 0.1}>
                                <Card className={`${index == 0 && "text-white"} justify-center bg-cover bg-center border-0 shadow-none ${card.bg}`}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                        {card.icon}
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`${index != 0 && "text-primary"} text-2xl`}>
                                            {card.title === 'Total Earnings'
                                                ? `$${card.value}k`
                                                : card.title === 'Hours Today'
                                                    ? `${Math.floor(stats.hoursToday)}h ${Math.round((stats.hoursToday % 1) * 60)}m`
                                                    : card.title === 'Hours This Week'
                                                        ? `${Math.floor(stats.hoursWeek)}h ${Math.round((stats.hoursWeek % 1) * 60)}m`
                                                        : card.title === 'Hours This Month'
                                                            ? `${Math.floor(stats.hoursMonth)}h ${Math.round((stats.hoursMonth % 1) * 60)}m`
                                                            : `${card.value}h`
                                            }
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            {getPercentageIcon(card.percentage, index)}
                                            <span className={getPercentageColor(card.percentage, index)}>
                                                {card.title === 'Total Earnings'
                                                    ? `+${card.percentage}% from last month`
                                                    : card.title === 'Hours Today'
                                                        ? `${card.percentage}% of target`
                                                        : card.title === 'Hours This Week'
                                                            ? `${card.percentage}% of target`
                                                            : card.title === 'Hours This Month'
                                                                ? `${card.percentage}% of target`
                                                                : `${card.percentage}% from last period`
                                                }
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </MotionBlock>
                        );
                    })}
                </div>
            </MotionBlock>

            {/* Tabs Section */}
            <MotionBlock delay={0.2}>
                <Tabs defaultValue="today" className="space-y-4">
                    <TabsList>
                        <TabsTrigger onClick={() => setShowAdd(true)} value="today">
                            Today's Tasks ({recentActivity.filter(activity => {
                                const today = new Date().toDateString()
                                return new Date(activity.date).toDateString() === today
                            }).length})
                        </TabsTrigger>
                        <TabsTrigger onClick={() => setShowAdd(false)} value="yesterday">
                            Yesterday's Tasks ({recentActivity.filter(activity => {
                                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
                                return new Date(activity.date).toDateString() === yesterday
                            }).length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Today's Tasks */}
                    <TabsContent value="today" className="space-y-4">
                        <MotionBlock delay={0.2}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-gradient text-xl">Today's Tasks</CardTitle>
                                    <CardDescription>Tasks logged for today</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentActivity.filter(activity => {
                                        const today = new Date().toDateString()
                                        return new Date(activity.date).toDateString() === today
                                    }).length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.filter(activity => {
                                                const today = new Date().toDateString()
                                                return new Date(activity.date).toDateString() === today
                                            }).map((activity) => (
                                                <div key={activity.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                            <Clock className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{activity.title}</p>
                                                            <p className="text-xs text-muted-foreground">Company: {activity.company}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {activity.hours && (
                                                            <span className="text-xs text-muted-foreground">{activity.hours}h</span>
                                                        )}
                                                        <div
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                                                        >
                                                            {activity.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No tasks logged for today yet.</p>
                                            <p className="text-sm">Start logging your time to see your progress!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </MotionBlock>
                    </TabsContent>

                    {/* Yesterday's Tasks */}
                    <TabsContent value="yesterday" className="space-y-4">
                        <MotionBlock delay={0.2}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl text-primary">Yesterday's Tasks</CardTitle>
                                    <CardDescription>Tasks logged for yesterday</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentActivity.filter(activity => {
                                        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
                                        return new Date(activity.date).toDateString() === yesterday
                                    }).length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.filter(activity => {
                                                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
                                                return new Date(activity.date).toDateString() === yesterday
                                            }).map((activity) => (
                                                <div key={activity.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                            <Clock className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{activity.title}</p>
                                                            <p className="text-xs text-muted-foreground">Company: {activity.company}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {activity.hours && (
                                                            <span className="text-xs text-muted-foreground">{activity.hours}h</span>
                                                        )}
                                                        <div
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                                                        >
                                                            {activity.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No tasks logged for yesterday.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </MotionBlock>
                    </TabsContent>
                </Tabs>
            </MotionBlock>
        </div>
    )
}