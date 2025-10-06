"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    FileText,
    Image,
    Video,
    Music,
    Archive,
    File,
    Link as LinkIcon,
    X,
    Upload,
    Eye,
    Download,
    Loader2,
    Trash
} from "lucide-react"
import { cn, textCropper } from "@/lib/utils"
import { uploadFile, validateFile, type UploadProgress } from "@/services/upload"
import { toast } from "sonner"

export interface Attachment {
    id: string
    name: string
    type: "file" | "url"
    url?: string
    file?: File
    size?: number
    preview?: string
    uploadProgress?: number
    isUploading?: boolean
    uploadError?: string
}

interface FileAttachmentProps {
    attachments: Attachment[]
    onAttachmentsChange: (attachments: Attachment[]) => void
    maxFiles?: number
    maxSize?: number // in bytes
    acceptedFileTypes?: string[]
    autoUpload?: boolean
    showUrlInput?: boolean
    showFileInput?: boolean
}

const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-4 w-4" />
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />
    if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) return <Archive className="h-4 w-4" />
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileAttachment({
    attachments,
    onAttachmentsChange,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedFileTypes = ["image/*", "application/pdf", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    autoUpload = false,
    showUrlInput = false,
    showFileInput = true
}: FileAttachmentProps) {
    const [urlInput, setUrlInput] = useState("");
    const [urlNameInput, setUrlNameInput] = useState("");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newAttachments: Attachment[] = acceptedFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: "file" as const,
            file,
            size: file.size,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
        }))
        const updatedAttachments = [...attachments, ...newAttachments]
        onAttachmentsChange(updatedAttachments)
    }, [attachments, onAttachmentsChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: maxFiles - attachments.length,
        maxSize,
        accept: acceptedFileTypes.reduce((acc, type) => {
            acc[type] = []
            return acc
        }, {} as Record<string, string[]>)
    })

    const removeAttachment = (id: string) => {
        const attachment = attachments.find(a => a.id === id)
        if (attachment?.preview) {
            URL.revokeObjectURL(attachment.preview)
        }
        onAttachmentsChange(attachments.filter(a => a.id !== id))
    }

    const openAttachment = (attachment: Attachment) => {
        if (attachment.type === "url") {
            window.open(attachment.url, "_blank")
        } else if (attachment.file) {
            const url = URL.createObjectURL(attachment.file)
            window.open(url, "_blank")
        } else if (attachment.url) {
            window.open(attachment.url, "_blank")
        }
    }

    const addUrlAttachment = () => {
        if (!urlInput.trim()) return;
        const newAttachment: Attachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: urlNameInput.trim() || urlInput.trim(),
            type: "url",
            url: urlInput.trim(),
        };
        onAttachmentsChange([...attachments, newAttachment]);
        setUrlInput("");
        setUrlNameInput("");
    };

    return (
        <div className="space-y-4">
            {showFileInput && (
                <div className="space-y-2">
                    <Label>
                        File Attachments ({attachments.filter(a => a.type === 'file').length}/{maxFiles})
                    </Label>
                    {/* File Drop Zone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        {isDragActive ? (
                            <p className="text-sm text-muted-foreground">Drop files here...</p>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Drag & drop files here, or click to select
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Max {maxFiles} files, {formatFileSize(maxSize)} each
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Accepted: {acceptedFileTypes.join(", ")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* URL Input Section */}
            {showUrlInput && (
                <div className="space-y-2">
                    <Label>Add URL</Label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="https://example.com"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                        />
                        <Input
                            type="text"
                            placeholder="Link name (optional)"
                            value={urlNameInput}
                            onChange={e => setUrlNameInput(e.target.value)}
                        />
                        <Button type="button" className="gradient" onClick={addUrlAttachment}>
                            Add
                        </Button>
                    </div>
                </div>
            )}
            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    <Label>
                        {showFileInput && showUrlInput ? 'Selected Files & URLs' :
                            showFileInput ? 'Selected Files' :
                                showUrlInput ? 'Selected URLs' : 'Selected Attachments'}
                    </Label>
                    <div className="space-y-2">
                        {attachments.map((attachment) => (
                            <Card key={attachment.id} className="p-3 bg-pale">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {attachment.type === "url" ? (
                                                <LinkIcon className="h-5 w-5 text-blue-500" />
                                            ) : attachment.file ? (
                                                getFileIcon(attachment.file.type)
                                            ) : (
                                                <File className="h-5 w-5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{textCropper(attachment.name, 30)}</p>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openAttachment(attachment)}
                                                className="h-8 w-8 p-0"
                                            >
                                                {attachment.type === "url" ? (
                                                    <Eye className="h-4 w-4" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(attachment.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
} 