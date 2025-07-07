import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, User, Calendar, Clock, FolderOpen, Eye, Download, Building2 } from "lucide-react";
import DOMPurify from "dompurify";
import React from "react";

export interface Attachment {
    id?: string;
    name: string;
    type: string;
    url?: string;
}

export interface Url {
    name?: string;
    url: string;
}

export interface Project {
    name: string;
    status: string;
    progress: number;
    deadline: string;
    department: {
        name: string;
        status: string;
        head: string;
        description?: string;
    };
}

export interface TaskDetailModalProps {
    open: boolean;
    onClose: () => void;
    task: any; // Should be typed more strictly if possible
    attachments?: Attachment[];
    urls?: Url[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onClose, task, attachments = [], urls = [] }) => {
    if (!task) return null;
    return (
        <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4">
                    <DialogHeader className="flex flex-row items-center gap-4 w-full">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            {task.title || "Task Details"}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogClose asChild>
                        <button
                            className="ml-auto rounded-full p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Close"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </div>
                {/* Main Content - all info in one section */}
                <div className="flex-1 py-8 md:py-12 px-8 overflow-y-auto h-full flex flex-col gap-6">
                    {/* Header and Meta */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {task.title}
                                {(() => {
                                    switch (task.status?.toLowerCase()) {
                                        case 'active':
                                            return <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'>Active</Badge>;
                                        case 'draft':
                                            return <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800'>Draft</Badge>;
                                        default:
                                            return <Badge variant='outline'>{task.status}</Badge>;
                                    }
                                })()}
                                {task.project && <Badge variant="secondary">{task.project.name}</Badge>}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap gap-4 mt-2 text-sm items-center">
                                {task.user && <span className="flex items-center gap-1"><User className="h-4 w-4" />{task.user.fullName || 'No owner'}</span>}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    {task.updatedAt && <><span className="mx-2">|</span>
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <span>Last Updated: {new Date(task.updatedAt).toLocaleDateString()} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>}
                                </span>
                                {task.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{Number(task.duration) >= 60 ? `${Math.floor(Number(task.duration) / 60)}h ${Number(task.duration) % 60}m` : `${task.duration}m`}</span>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="font-semibold mb-1">Description</div>
                                <div className="rounded bg-muted p-3 text-sm min-h-[60px] prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description || 'No description provided') }} />
                            </div>
                            {/* Attachments & URLs */}
                            {attachments.length > 0 && (
                                <div className="mb-4">
                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-muted-foreground" /> Attachments
                                    </div>
                                    <div className="space-y-2">
                                        {attachments.map((attachment) => {
                                            const isImage = attachment.type === 'file' && attachment.url && /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(attachment.url);
                                            if (attachment.type === 'url') {
                                                return (
                                                    <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                                        <CardContent className="p-0">
                                                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 underline">
                                                                <Eye className="h-4 w-4" />
                                                                <span className="truncate max-w-xs">{attachment.name || attachment.url}</span>
                                                            </a>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            } else if (isImage) {
                                                return (
                                                    <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                                        <CardContent className="p-0">
                                                            <div className="flex flex-col items-start gap-2">
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.name}
                                                                        className="rounded-lg max-h-48 object-contain border mb-2"
                                                                        style={{ background: '#f8fafc' }}
                                                                    />
                                                                </a>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium truncate max-w-xs">{attachment.name}</span>
                                                                    <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                                                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download image">
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            } else {
                                                // Default: file (not image)
                                                return (
                                                    <Card key={attachment.id || attachment.url || attachment.name} className="p-3">
                                                        <CardContent className="p-0">
                                                            <div className="flex items-center gap-3">
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                    <Download className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="truncate max-w-xs">{attachment.name}</span>
                                                                </a>
                                                                <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download file">
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </a>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* URLs (if present and not in attachments) */}
                            {urls.length > 0 && (
                                <div className="mb-4">
                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-blue-500" /> Links
                                    </div>
                                    <ul className="space-y-1">
                                        {urls.map((u, idx) => (
                                            <li key={u.url || idx} className="flex items-center gap-2">
                                                <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                                    <Eye className="h-4 w-4" />
                                                    <span>{u.name || u.url}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Project Info, Department Info, Timeline in one row */}
                    {typeof task.project === 'object' && task.project !== null ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Project Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-muted-foreground" />{task.project.name}<Badge variant="outline" className="capitalize ml-2">{task.project.status}</Badge></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="font-medium">Progress:</span>
                                        <div className="flex-1 max-w-xs">
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${task.project.progress}%` }} />
                                            </div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold">{task.project.progress}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Deadline:</span> {task.project.deadline ? new Date(task.project.deadline).toLocaleDateString() : ''}</div>
                                </CardContent>
                            </Card>
                            {/* Department Info */}
                            {task.project.department && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" />{task.project.department.name}<Badge variant="outline" className="capitalize ml-2">{task.project.department.status}</Badge></CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 mb-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Head:</span> {task.project.department.head}</div>
                                        <div className="rounded bg-muted p-3 text-sm"><span className="font-semibold">Description:</span> {task.project.department.description || 'No description'}</div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        task.project && (
                            <div className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                            {typeof task.project === 'string' ? task.project : String(task.project)}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal; 