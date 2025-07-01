"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileAttachment, type Attachment } from "@/components/file-attachment"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    FileText,
    Image,
    Video,
    Music,
    Archive,
    File,
    Link as LinkIcon,
    Type,
    Paperclip,
    Eye,
    Download
} from "lucide-react"

export default function TimeLogDemoPage() {
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [richTextContent, setRichTextContent] = useState("")
    const [plainTextContent, setPlainTextContent] = useState("")

    const handleSubmit = () => {
        console.log("Rich Text Content:", richTextContent)
        console.log("Plain Text Content:", plainTextContent)
        console.log("Attachments:", attachments)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Time Logging Features Demo</h1>
                    <p className="text-muted-foreground">
                        Explore the new file attachment and rich text editor features
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Rich Text Editor Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5" />
                            Rich Text Editor
                        </CardTitle>
                        <CardDescription>
                            Enhanced description editor with formatting options
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs defaultValue="rich" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="rich" className="flex items-center gap-2">
                                    <Type className="h-4 w-4" />
                                    Rich Text
                                </TabsTrigger>
                                <TabsTrigger value="plain" className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Plain Text
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="rich" className="mt-4">
                                <RichTextEditor
                                    value={richTextContent}
                                    onChange={setRichTextContent}
                                    placeholder="Try adding some rich formatting to your description..."
                                    className="min-h-[200px]"
                                />
                            </TabsContent>
                            <TabsContent value="plain" className="mt-4">
                                <textarea
                                    placeholder="Or use plain text for simple descriptions..."
                                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={plainTextContent}
                                    onChange={(e) => setPlainTextContent(e.target.value)}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* File Attachment Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            File Attachments
                        </CardTitle>
                        <CardDescription>
                            Upload files and add URLs with preview support
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileAttachment
                            attachments={attachments}
                            onAttachmentsChange={setAttachments}
                            maxFiles={5}
                            maxSize={5 * 1024 * 1024} // 5MB for demo
                            acceptedFileTypes={["image/*", "application/pdf"]}
                            showUrlInput={true}
                            autoUpload={false} // Disable auto-upload for demo
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Features Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Features Overview</CardTitle>
                    <CardDescription>
                        What's new in the enhanced time logging system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Rich Text Editor</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Bold, italic, underline formatting</li>
                                <li>• Headers and text alignment</li>
                                <li>• Bullet and numbered lists</li>
                                <li>• Color and background options</li>
                                <li>• Link and image insertion</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">File Attachments</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Drag & drop file upload</li>
                                <li>• Image preview support</li>
                                <li>• Progress tracking</li>
                                <li>• Multiple file types</li>
                                <li>• File size validation</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">URL Support</h3>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Add external links</li>
                                <li>• URL validation</li>
                                <li>• Custom link titles</li>
                                <li>• One-click access</li>
                                <li>• Link preview</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        See how your time log entry will look
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Task Description</h3>
                        <div className="border rounded-md p-4 bg-muted/50">
                            {richTextContent ? (
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: richTextContent }}
                                />
                            ) : (
                                <p className="text-muted-foreground italic">No content yet</p>
                            )}
                        </div>
                    </div>

                    {attachments.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Attachments ({attachments.length})</h3>
                            <div className="grid gap-2">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-md">
                                        {attachment.type === "url" ? (
                                            <LinkIcon className="h-5 w-5 text-blue-500" />
                                        ) : attachment.file ? (
                                            getFileIcon(attachment.file.type)
                                        ) : (
                                            <File className="h-5 w-5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{attachment.name}</p>
                                            {attachment.type === "file" && attachment.size && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(attachment.size)}
                                                </p>
                                            )}
                                            {attachment.type === "url" && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {attachment.url}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => openAttachment(attachment)}>
                                            {attachment.type === "url" ? (
                                                <Eye className="h-4 w-4" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} className="w-full sm:w-auto">
                            Submit Time Log
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper functions
const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-5 w-5" />
    if (fileType.startsWith("video/")) return <Video className="h-5 w-5" />
    if (fileType.startsWith("audio/")) return <Music className="h-5 w-5" />
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) return <Archive className="h-5 w-5" />
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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