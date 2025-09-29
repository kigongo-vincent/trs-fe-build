"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, Save, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

type QuoteType = {
    id: string;
    text: string;
    author: string;
    isActive: boolean;
    page: 'login' | 'signup';
    order: number;
    createdAt: string;
    updatedAt: string;
}

const quoteSchema = z.object({
    text: z.string().min(10, "Quote must be at least 10 characters"),
    author: z.string().min(1, "Author is required"),
    isActive: z.boolean(),
    page: z.enum(['login', 'signup']),
    order: z.coerce.number().min(1, "Order must be at least 1"),
})

type QuoteForm = z.infer<typeof quoteSchema>

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<QuoteType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tab, setTab] = useState<string>("all")
    const [search, setSearch] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingQuote, setEditingQuote] = useState<QuoteType | null>(null)

    // Mock data for now - replace with actual API calls
    useEffect(() => {
        const mockQuotes: QuoteType[] = [
            {
                id: "1",
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                isActive: true,
                page: 'login',
                order: 1,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            },
            {
                id: "2",
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                isActive: true,
                page: 'signup',
                order: 1,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            },
            {
                id: "3",
                text: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs",
                isActive: false,
                page: 'login',
                order: 2,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01"
            }
        ]

        setTimeout(() => {
            setQuotes(mockQuotes)
            setLoading(false)
        }, 1000)
    }, [])

    // Filter and search logic
    const filteredQuotes = quotes.filter(quote => {
        // Filter by tab
        if (tab === "active" && !quote.isActive) return false
        if (tab === "inactive" && quote.isActive) return false
        if (tab === "login" && quote.page !== "login") return false
        if (tab === "signup" && quote.page !== "signup") return false

        // Search by text or author
        if (search.trim() !== "") {
            const s = search.toLowerCase()
            return (
                quote.text.toLowerCase().includes(s) ||
                quote.author.toLowerCase().includes(s)
            )
        }
        return true
    })

    // Create quote form
    const form = useForm<QuoteForm>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            text: "",
            author: "",
            isActive: true,
            page: 'login',
            order: 1,
        },
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreateQuote = async (data: QuoteForm) => {
        setIsSubmitting(true)
        try {
            // Mock API call - replace with actual API
            const newQuote: QuoteType = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            }

            setQuotes(prev => [...prev, newQuote])
            toast.success("Quote created!", { description: `Quote by ${data.author} was created successfully.` })
            setModalOpen(false)
            form.reset()
        } catch (err: any) {
            toast.error("Error", { description: err.message || "Failed to create quote" })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Edit quote form
    const editForm = useForm<QuoteForm>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            text: "",
            author: "",
            isActive: true,
            page: 'login',
            order: 1,
        },
    })
    const [isEditSubmitting, setIsEditSubmitting] = useState(false)

    // When editingQuote changes, reset the form with its values
    useEffect(() => {
        if (editingQuote) {
            editForm.reset({
                text: editingQuote.text,
                author: editingQuote.author,
                isActive: editingQuote.isActive,
                page: editingQuote.page,
                order: editingQuote.order,
            })
        }
    }, [editingQuote, editForm])

    const handleEditQuote = async (data: QuoteForm) => {
        if (!editingQuote) return
        setIsEditSubmitting(true)
        try {
            // Mock API call - replace with actual API
            const updatedQuote = { ...editingQuote, ...data, updatedAt: new Date().toISOString().split('T')[0] }
            setQuotes(prev => prev.map(quote => quote.id === editingQuote.id ? updatedQuote : quote))
            toast.success("Quote updated!", { description: `Quote by ${data.author} was updated successfully.` })
            setEditModalOpen(false)
            setEditingQuote(null)
        } catch (err: any) {
            toast.error("Error", { description: err.message || "Failed to update quote" })
        } finally {
            setIsEditSubmitting(false)
        }
    }

    const handleToggleActive = async (quote: QuoteType) => {
        try {
            const updatedQuote = { ...quote, isActive: !quote.isActive, updatedAt: new Date().toISOString().split('T')[0] }
            setQuotes(prev => prev.map(q => q.id === quote.id ? updatedQuote : q))
            toast.success(updatedQuote.isActive ? "Quote activated!" : "Quote deactivated!")
        } catch (err: any) {
            toast.error("Error", { description: "Failed to update quote status" })
        }
    }

    const totalQuotes = quotes.length;
    const activeQuotes = quotes.filter(q => q.isActive).length;
    const loginQuotes = quotes.filter(q => q.page === 'login').length;
    const signupQuotes = quotes.filter(q => q.page === 'signup').length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Quotes Settings</h1>
                <div className="flex items-center gap-2">
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Quote
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Quote</DialogTitle>
                                <DialogDescription>Create a new inspirational quote for the login or signup page.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleCreateQuote)} className="space-y-4">
                                    <FormField control={form.control} name="text" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quote Text</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter the inspirational quote..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="author" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Author</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Quote author" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="page" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Page</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="login">Login Page</option>
                                                        <option value="signup">Signup Page</option>
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="order" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Order</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={1} placeholder="1" {...field} disabled={isSubmitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="isActive" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active</FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    Show this quote on the selected page
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                            Create Quote
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuotes}</div>
                        <p className="text-xs text-muted-foreground">All quotes in system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeQuotes}</div>
                        <p className="text-xs text-muted-foreground">Currently displayed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Login Quotes</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loginQuotes}</div>
                        <p className="text-xs text-muted-foreground">For login page</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Signup Quotes</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{signupQuotes}</div>
                        <p className="text-xs text-muted-foreground">For signup page</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="all">All Quotes</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                        <TabsTrigger value="login">Login Page</TabsTrigger>
                        <TabsTrigger value="signup">Signup Page</TabsTrigger>
                    </TabsList>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search quotes..."
                                className="w-full pl-8"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <TabsContent value={tab} className="space-y-4">
                    {loading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="p-4">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-8 w-16" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 text-red-500">{error}</div>
                    ) : filteredQuotes.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">No quotes found.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredQuotes.map(quote => (
                                <Card key={quote.id} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={quote.isActive ? "default" : "secondary"}>
                                                {quote.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <Badge variant="outline">
                                                {quote.page === 'login' ? 'Login' : 'Signup'}
                                            </Badge>
                                        </div>
                                        <blockquote className="text-sm italic border-l-4 border-primary pl-3">
                                            "{quote.text}"
                                        </blockquote>
                                        <div className="text-xs text-muted-foreground">
                                            — {quote.author}
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-xs text-muted-foreground">
                                                Order: {quote.order}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(quote)}
                                                >
                                                    {quote.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => { setEditingQuote(quote); setEditModalOpen(true); }}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={open => { setEditModalOpen(open); if (!open) setEditingQuote(null) }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Quote</DialogTitle>
                        <DialogDescription>Update the quote details.</DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleEditQuote)} className="space-y-4">
                            <FormField control={editForm.control} name="text" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quote Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter the inspirational quote..."
                                            className="min-h-[100px]"
                                            {...field}
                                            disabled={isEditSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={editForm.control} name="author" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Quote author" {...field} disabled={isEditSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={editForm.control} name="page" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Page</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                                disabled={isEditSubmitting}
                                            >
                                                <option value="login">Login Page</option>
                                                <option value="signup">Signup Page</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="order" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} placeholder="1" {...field} disabled={isEditSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={editForm.control} name="isActive" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Show this quote on the selected page
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isEditSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit" disabled={isEditSubmitting}>
                                    {isEditSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
