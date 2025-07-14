"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Users, Pencil, Trash, UserX, Plus, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember } from "@/services/api"
import { getAuthData } from "@/services/auth"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select"

interface BoardMember {
    id: string
    email: string
    status: string
    fullName: string
    role?: string // add role field
    // add other fields as needed
}

export default function BoardMembersPage() {
    const [members, setMembers] = useState<BoardMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editMember, setEditMember] = useState<BoardMember | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteMember, setDeleteMember] = useState<BoardMember | null>(null)
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [form, setForm] = useState({ name: "", email: "", role: "" })
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
    const [deactivateMember, setDeactivateMember] = useState<BoardMember | null>(null)

    const companyId = getAuthData()?.user?.company?.id

    // Add this helper at the top of the component
    function isDeactivated(status: string) {
        return status === "inactive" || status === "suspended";
    }

    // Add a type guard for BoardMember
    function isBoardMember(m: any): m is BoardMember {
        return (
            typeof m.id === 'string' &&
            typeof m.email === 'string' &&
            typeof m.status === 'string' &&
            typeof m.fullName === 'string'
        )
    }

    // Fetch members
    useEffect(() => {
        if (!companyId) return
        setLoading(true)
        getBoardMembers(companyId)
            .then(res => {
                // If API returns { data: [...] }
                const members = Array.isArray(res.data) ? res.data.map((m: any) => {
                    return {
                        id: String(m.id),
                        email: m.email,
                        status: m.status,
                        fullName: m.fullName || m.name || m.firstName || m.email,
                        role: m.role || ""
                    }
                }).filter(isBoardMember) : []
                setMembers(members)
            })
            .catch(() => setMembers([]))
            .finally(() => setLoading(false))
    }, [companyId])

    // Create
    const handleCreate = async () => {
        if (!companyId) return
        setLoading(true)
        try {
            await createBoardMember({ fullName: form.name, email: form.email, companyId, role: form.role })
            // Refetch members
            const res = await getBoardMembers(companyId)
            const members = Array.isArray(res.data) ? res.data.map((m: any) => {
                return {
                    id: String(m.id),
                    email: m.email,
                    status: m.status,
                    fullName: m.fullName || m.name || m.firstName || m.email,
                    role: m.role || ""
                }
            }).filter(isBoardMember) : []
            setMembers(members)
        } catch (e: any) {
            toast("Error creating member", {
                description: e?.message || "An error occurred while creating the member.",
                style: { background: '#fee2e2', color: '#b91c1c' },
            })
        } finally {
            setForm({ name: "", email: "", role: "" })
            setIsCreateOpen(false)
            setLoading(false)
        }
    }

    // Edit
    const handleEdit = async () => {
        if (!editMember) return
        setLoading(true)
        try {
            await updateBoardMember({ memberId: editMember.id, fullName: form.name, email: form.email, role: form.role })
            // Refetch members
            if (companyId) {
                const res = await getBoardMembers(companyId)
                const members = Array.isArray(res.data) ? res.data.map((m: any) => {
                    return {
                        id: String(m.id),
                        email: m.email,
                        status: m.status,
                        fullName: m.fullName || m.name || m.firstName || m.email,
                        role: m.role || ""
                    }
                }).filter(isBoardMember) : []
                setMembers(members)
            }
        } catch (e: any) {
            toast("Error updating member", {
                description: e?.message || "An error occurred while updating the member.",
                style: { background: '#fee2e2', color: '#b91c1c' },
            })
        } finally {
            setEditMember(null)
            setForm({ name: "", email: "", role: "" })
            setIsEditOpen(false)
            setLoading(false)
        }
    }

    // Delete
    const handleDelete = async () => {
        if (!deactivateMember) return
        setIsDeactivating(true)
        try {
            await deleteBoardMember(deactivateMember.id)
            if (companyId) {
                const res = await getBoardMembers(companyId)
                const members = Array.isArray(res.data) ? res.data.map((m: any) => {
                    return {
                        id: String(m.id),
                        email: m.email,
                        status: m.status,
                        fullName: m.fullName || m.name || m.firstName || m.email,
                    }
                }).filter(isBoardMember) : []
                setMembers(members)
            }
        } finally {
            setDeactivateMember(null)
            setIsDeactivateOpen(false)
            setIsDeactivating(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
                    <Users className="h-6 w-6" /> Board Members
                </h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
            </div>
            <Card>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No board members found.</TableCell>
                                </TableRow>
                            ) : (
                                members.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{member.fullName ? member.fullName.split(" ").map(n => n[0]).join("") : member.email[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{member.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={member.status === "active" ? "default" : isDeactivated(member.status) ? "destructive" : "outline"}
                                                className={
                                                    member.status === "active"
                                                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                                        : isDeactivated(member.status)
                                                            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                                                            : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                                                }
                                            >
                                                {member.status === "active"
                                                    ? "Active"
                                                    : member.status === "pending"
                                                        ? "Pending"
                                                        : isDeactivated(member.status)
                                                            ? "Deactivated"
                                                            : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{typeof member.role === 'string' && member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : "_"}</TableCell>
                                        <TableCell className={`text-right flex gap-2 justify-end${isDeactivated(member.status) ? ' pointer-events-none bg-transparent hover:bg-transparent' : ''}`}>
                                            {!isDeactivated(member.status) ? (
                                                <>
                                                    <Button size="icon" variant="ghost" onClick={() => {
                                                        setEditMember(member)
                                                        setForm({ name: member.fullName || "", email: member.email, role: member.role || "" })
                                                        setIsEditOpen(true)
                                                    }} aria-label="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => {
                                                        setDeactivateMember(member)
                                                        setIsDeactivateOpen(true)
                                                    }} aria-label="Deactivate" disabled={isDeactivating}>
                                                        {isDeactivating && deactivateMember?.id === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-yellow-600" />}
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">_</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Board Member</DialogTitle>
                        <DialogDescription>Enter details for the new board member.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
                        <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        <Select value={form.role} onValueChange={value => setForm(f => ({ ...f, role: value }))} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reviewer">Reviewer</SelectItem>
                                <SelectItem value="approver">Approver</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Board Member</DialogTitle>
                        <DialogDescription>Update details for this board member.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEdit(); }}>
                        <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        <Select value={form.role} onValueChange={value => setForm(f => ({ ...f, role: value }))} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="reviewer">Reviewer</SelectItem>
                                <SelectItem value="approver">Approver</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Board Member</DialogTitle>
                        <DialogDescription>Are you sure you want to deactivate this board member? They will be marked as inactive.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeactivateOpen(false)} disabled={isDeactivating}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeactivating}>
                            {isDeactivating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isDeactivating ? "Deactivating..." : "Deactivate"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 