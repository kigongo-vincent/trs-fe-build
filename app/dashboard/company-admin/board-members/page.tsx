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

interface BoardMember {
    id: number
    name: string
    email: string
    role: string
    active: boolean
}

const initialMembers: BoardMember[] = [
    { id: 1, name: "Alice Johnson", email: "alice@company.com", role: "Chairperson", active: true },
    { id: 2, name: "Bob Smith", email: "bob@company.com", role: "Member", active: true },
    { id: 3, name: "Carol Lee", email: "carol@company.com", role: "Secretary", active: false },
]

export default function BoardMembersPage() {
    const [members, setMembers] = useState<BoardMember[]>(initialMembers)
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
    const [isActivateOpen, setIsActivateOpen] = useState(false)
    const [activateMember, setActivateMember] = useState<BoardMember | null>(null)

    // Create
    const handleCreate = () => {
        setMembers([
            ...members,
            {
                id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
                name: form.name,
                email: form.email,
                role: form.role,
                active: true,
            },
        ])
        setForm({ name: "", email: "", role: "" })
        setIsCreateOpen(false)
    }

    // Edit
    const handleEdit = () => {
        if (!editMember) return
        setMembers(members.map(m => m.id === editMember.id ? { ...editMember, ...form } : m))
        setEditMember(null)
        setForm({ name: "", email: "", role: "" })
        setIsEditOpen(false)
    }

    // Delete
    const handleDelete = () => {
        if (!deleteMember) return
        setIsDeleting(true)
        setTimeout(() => {
            setMembers(members.filter(m => m.id !== deleteMember.id))
            setDeleteMember(null)
            setIsDeleteOpen(false)
            setIsDeleting(false)
        }, 800)
    }

    // Deactivate
    const handleDeactivate = () => {
        if (!deactivateMember) return
        setIsDeactivating(true)
        setTimeout(() => {
            setMembers(members.map(m => m.id === deactivateMember.id ? { ...m, active: false } : m))
            setDeactivateMember(null)
            setIsDeactivateOpen(false)
            setIsDeactivating(false)
        }, 800)
    }

    // Activate
    const handleActivate = () => {
        if (!activateMember) return
        setMembers(members.map(m => m.id === activateMember.id ? { ...m, active: true } : m))
        setActivateMember(null)
        setIsActivateOpen(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-6 w-6" /> Board Members
                </h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Board Members List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                {/* Optionally use a placeholder image or just fallback */}
                                                {/* <AvatarImage src="/placeholder-user.jpg" alt={member.name} /> */}
                                                <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.active ? "default" : "outline"} className={member.active ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800" : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"}>
                                            {member.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex gap-2 justify-end">
                                        <Button size="icon" variant="ghost" onClick={() => {
                                            setEditMember(member)
                                            setForm({ name: member.name, email: member.email, role: member.role })
                                            setIsEditOpen(true)
                                        }} aria-label="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => {
                                            setDeleteMember(member)
                                            setIsDeleteOpen(true)
                                        }} aria-label="Delete">
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                        {member.active ? (
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                setDeactivateMember(member)
                                                setIsDeactivateOpen(true)
                                            }} aria-label="Deactivate" disabled={isDeactivating}>
                                                {isDeactivating && deactivateMember?.id === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-yellow-600" />}
                                            </Button>
                                        ) : (
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                setActivateMember(member)
                                                setIsActivateOpen(true)
                                            }} aria-label="Activate">
                                                <Users className="h-4 w-4 text-green-600" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
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
                        <Input placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit">Add</Button>
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
                        <Input placeholder="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Board Member</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this board member? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deactivate Confirmation Dialog */}
            <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Board Member</DialogTitle>
                        <DialogDescription>Are you sure you want to deactivate this board member? They will be marked as inactive.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeactivateOpen(false)} disabled={isDeactivating}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
                            {isDeactivating ? "Deactivating..." : "Deactivate"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Activate Confirmation Dialog */}
            <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Board Member</DialogTitle>
                        <DialogDescription>Are you sure you want to activate this board member? They will be marked as active.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsActivateOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleActivate}>
                            Activate
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 