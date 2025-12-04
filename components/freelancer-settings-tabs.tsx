"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MotionBlock } from "@/components/MotionBlock"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    DollarSign,
    Clock,
    Settings,
    Palette,
    Bell,
    Shield,
    Save,
    Upload,
    Camera
} from "lucide-react"
import { getAuthData } from "@/services/auth"

interface FreelancerProfile {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    bio: string
    location: string
    website: string
    hourlyRate: number
    currency: string
    timezone: string
    profilePicture: string
    skills: string[]
    availability: string
    workingHours: {
        start: string
        end: string
    }
    notifications: {
        email: boolean
        push: boolean
        sms: boolean
    }
    privacy: {
        profilePublic: boolean
        showEarnings: boolean
        showProjects: boolean
    }
    theme: {
        primaryColor: string
        darkMode: boolean
    }
}

export function FreelancerSettingsTabs() {
    const [generalPreferences, setGeneralPreferences] = useState({
        autoSaveDrafts: true,
        emailNotifications: true,
        weeklySummary: false
    })

    const [profile, setProfile] = useState<FreelancerProfile>({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        website: "",
        hourlyRate: 0,
        currency: "USD",
        timezone: "UTC",
        profilePicture: "",
        skills: [],
        availability: "available",
        workingHours: {
            start: "09:00",
            end: "17:00"
        },
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        privacy: {
            profilePublic: true,
            showEarnings: false,
            showProjects: true
        },
        theme: {
            primaryColor: "#8884d8",
            darkMode: false
        }
    })

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [newSkill, setNewSkill] = useState("")

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const authData = getAuthData()
            if (authData?.user) {
                setProfile(prev => ({
                    ...prev,
                    ...authData.user,
                    skills: authData.user.skills || [],
                    workingHours: authData.user.workingHours || { start: "09:00", end: "17:00" },
                    notifications: authData.user.notifications || { email: true, push: true, sms: false },
                    privacy: authData.user.privacy || { profilePublic: true, showEarnings: false, showProjects: true },
                    theme: authData.user.theme || { primaryColor: "#8884d8", darkMode: false }
                }))
            }
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Here you would typically save to your backend
            console.log("Saving profile:", profile)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
            console.error("Error saving profile:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill("")
        }
    }

    const removeSkill = (skill: string) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }))
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <MotionBlock delay={0}>
                <div className="flex md:h-[5vh] h-max items-center justify-between">
                    <div className="">
                        <h1 className="text tracking-tight">
                            <span className="font-semibold">Settings</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Customize your freelancer profile and preferences</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="gradient rounded-full">
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </MotionBlock>

            <MotionBlock delay={0.1}>
                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <Button size="sm" className="absolute -bottom-2 -right-2">
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={profile.phone}
                                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={profile.location}
                                            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={profile.website}
                                            onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={profile.bio}
                                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Professional Information
                                    </CardTitle>
                                    <CardDescription>Set your rates and availability</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="hourlyRate">Hourly Rate</Label>
                                        <div className="flex gap-2">
                                            <Select value={profile.currency} onValueChange={(value) => setProfile(prev => ({ ...prev, currency: value }))}>
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                    <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                                                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                                                    <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                                                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                                                    <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                                                    <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                                                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                                                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                    <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                id="hourlyRate"
                                                type="number"
                                                value={profile.hourlyRate}
                                                onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="EST">Eastern Time</SelectItem>
                                                <SelectItem value="PST">Pacific Time</SelectItem>
                                                <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="availability">Availability</Label>
                                        <Select value={profile.availability} onValueChange={(value) => setProfile(prev => ({ ...prev, availability: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="busy">Busy</SelectItem>
                                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Working Hours</Label>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="startTime">Start</Label>
                                                <Input
                                                    id="startTime"
                                                    type="time"
                                                    value={profile.workingHours.start}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        workingHours: { ...prev.workingHours, start: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="endTime">End</Label>
                                                <Input
                                                    id="endTime"
                                                    type="time"
                                                    value={profile.workingHours.end}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        workingHours: { ...prev.workingHours, end: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Skills</Label>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add a skill"
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            />
                                            <Button onClick={addSkill} size="sm">Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill) => (
                                                <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                                                    {skill} ×
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    General Preferences
                                </CardTitle>
                                <CardDescription>Configure your default settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Auto-save drafts</Label>
                                        <p className="text-sm text-muted-foreground">Automatically save your work as drafts</p>
                                    </div>
                                    <Switch
                                        checked={generalPreferences.autoSaveDrafts}
                                        onCheckedChange={(checked) => setGeneralPreferences(prev => ({
                                            ...prev,
                                            autoSaveDrafts: checked
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email notifications for new projects</Label>
                                        <p className="text-sm text-muted-foreground">Get notified when new projects are available</p>
                                    </div>
                                    <Switch
                                        checked={generalPreferences.emailNotifications}
                                        onCheckedChange={(checked) => setGeneralPreferences(prev => ({
                                            ...prev,
                                            emailNotifications: checked
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Weekly summary emails</Label>
                                        <p className="text-sm text-muted-foreground">Receive weekly reports of your activity</p>
                                    </div>
                                    <Switch
                                        checked={generalPreferences.weeklySummary}
                                        onCheckedChange={(checked) => setGeneralPreferences(prev => ({
                                            ...prev,
                                            weeklySummary: checked
                                        }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>Choose how you want to be notified</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.email}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            notifications: { ...prev.notifications, email: checked }
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.push}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            notifications: { ...prev.notifications, push: checked }
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>SMS Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.sms}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            notifications: { ...prev.notifications, sms: checked }
                                        }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Privacy Settings
                                </CardTitle>
                                <CardDescription>Control what information is visible to others</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Public Profile</Label>
                                        <p className="text-sm text-muted-foreground">Make your profile visible to potential clients</p>
                                    </div>
                                    <Switch
                                        checked={profile.privacy.profilePublic}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, profilePublic: checked }
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Show Earnings</Label>
                                        <p className="text-sm text-muted-foreground">Display your earnings on your profile</p>
                                    </div>
                                    <Switch
                                        checked={profile.privacy.showEarnings}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showEarnings: checked }
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Show Projects</Label>
                                        <p className="text-sm text-muted-foreground">Display your projects on your profile</p>
                                    </div>
                                    <Switch
                                        checked={profile.privacy.showProjects}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showProjects: checked }
                                        }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Appearance Settings
                                </CardTitle>
                                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Dark Mode</Label>
                                        <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                                    </div>
                                    <Switch
                                        checked={profile.theme.darkMode}
                                        onCheckedChange={(checked) => setProfile(prev => ({
                                            ...prev,
                                            theme: { ...prev.theme, darkMode: checked }
                                        }))}
                                    />
                                </div>
                                <Separator />
                                <div>
                                    <Label htmlFor="primaryColor">Primary Color</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            id="primaryColor"
                                            type="color"
                                            value={profile.theme.primaryColor}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                theme: { ...prev.theme, primaryColor: e.target.value }
                                            }))}
                                            className="w-16 h-10"
                                        />
                                        <Input
                                            value={profile.theme.primaryColor}
                                            onChange={(e) => setProfile(prev => ({
                                                ...prev,
                                                theme: { ...prev.theme, primaryColor: e.target.value }
                                            }))}
                                            placeholder="#8884d8"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </MotionBlock>
        </div>
    )
}
