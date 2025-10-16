import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, User, Calendar, Clock, FolderOpen, Eye, Download, Building2 } from "lucide-react";
import DOMPurify from "dompurify";
import React from "react";
import { textCropper } from "@/lib/utils";
import Link from "next/link";

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
            <DialogContent className="md:max-w-4xl max-w-[95vw] w-full max-h-[90vh] bg-pale p-0 overflow-y-auto">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-paper flex items-center justify-between  px-8 py-4">
                    <DialogHeader className="flex flex-row items-center gap-4 w-full">
                        <DialogTitle className="flex items-center gap-2 text-base font-medium z-40">
                            {"Task Details"}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogClose asChild>
                        <button
                            className="ml-auto rounded-full p-2 hover:bg-muted "
                            aria-label="Close"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </div>
                {/* Main Content - all info in one section */}
                <div className="flex-1 bg-pale md:py-12 px-8 overflow-y-auto h-full flex flex-col gap-6">
                    {/* Header and Meta */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-gradient  items-center gap-2">
                                <div className="max-w-[70vw] md:max-w-[40vw]">
                                    {task.title}
                                </div>

                                <div className="flex gap-2 my-3">
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
                                    {task.project && <Badge variant="secondary">{task.project}</Badge>}
                                </div>
                            </CardTitle>
                            <CardDescription className="flex flex-wrap gap-4 mt-2 text-sm items-center">
                                {/* {task.user && <span className="flex items-center gap-1"><User className="h-4 w-4" />{task.user.fullName || 'No owner'}</span>} */}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span>Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    <div className="hidden md:flex items-center gap-2">
                                        {task.updatedAt && <><span className="mx-2">|</span>
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span>Last Updated: {new Date(task.updatedAt).toLocaleDateString()} <Clock className="inline h-4 w-4 text-muted-foreground ml-1" /> {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>}
                                    </div>
                                </span>

                            </CardDescription>
                            {task.duration && <div className="flex border w-max px-4 py-1 rounded-full items-center gap-1 text-"><Clock className="h-4 w-4" />{Number(task.duration) >= 60 ? `${Math.floor(Number(task.duration) / 60)}h ${Number(task.duration) % 60}m` : `${task.duration}m`}</div>}
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="rounded bg-pale p-6 leading-8 text-sm min-h-[60px] prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description || 'No description provided') }} />
                            </div>
                            {/* Attachments & URLs */}
                            {attachments.length > 0 && (
                                <div className="mb-4">
                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                        Attachments
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
                                                    <Card key={attachment.id || attachment.url || attachment.name} className="bg-pale flex items-center justify-between p-2 rounded">
                                                        <CardContent className="p-0 h-max  w-max">
                                                            <div className="flex  items-center gap-2">
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.name}
                                                                        className="rounded-lg h-10 w-10 object-cover  border"
                                                                        style={{ background: '#f8fafc' }}
                                                                    />
                                                                </a>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium truncate max-w-xs">{textCropper(attachment.name, 20)}</span>

                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2">
                                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 p-0" title="Download image">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </Card>
                                                );
                                            } else {
                                                // Default: file (not image)
                                                return (
                                                    <Card key={attachment.id || attachment.url || attachment.name} className="p-3 bg-pale shadow-none">
                                                        <CardContent className="p-0">
                                                            <div className="flex items-center  gap-3 justify-between">
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                    {/* <Download className="h-4 w-4 text-muted-foreground" /> */}
                                                                    <span className="truncate max-w-xs">{textCropper(attachment.name, 20)}</span>
                                                                </a>
                                                                <a href={attachment.url} download target="_blank" rel="noopener noreferrer" className="ml-2 ">
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

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailModal; 