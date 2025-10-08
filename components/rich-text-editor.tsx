"use client"

import React, { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Eraser
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Start writing...",
  className,
  readOnly = false
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      TextStyle,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  if (!isClient) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label>{label}</Label>}
        <div className="h-32 bg-muted animate-pulse rounded-md" />
      </div>
    )
  }

  if (!editor) {
    return null
  }



  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className=" rounded-md ">
        {!readOnly && (
          <>
            <div className="flex flex-wrap items-center gap-1 p-2  bg-pale">
              {/* Text Formatting */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-primary text-primary-foreground")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-primary text-primary-foreground")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-primary text-primary-foreground")}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Headers */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 1 }) && "bg-primary text-primary-foreground")}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 2 }) && "bg-primary text-primary-foreground")}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 3 }) && "bg-primary text-primary-foreground")}
              >
                <Heading3 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Lists */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-primary text-primary-foreground")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-primary text-primary-foreground")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Alignment */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "left" }) && "bg-primary text-primary-foreground")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "center" }) && "bg-primary text-primary-foreground")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "right" }) && "bg-primary text-primary-foreground")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                className={cn("h-8 w-8 p-0", editor.isActive({ textAlign: "justify" }) && "bg-primary text-primary-foreground")}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Colors */}
              {/* <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor("#ef4444")}
                  className="h-8 w-6 p-0 bg-red-500 hover:bg-red-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor("#3b82f6")}
                  className="h-8 w-6 p-0 bg-blue-500 hover:bg-blue-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor("#10b981")}
                  className="h-8 w-6 p-0 bg-green-500 hover:bg-green-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor("#f59e0b")}
                  className="h-8 w-6 p-0 bg-yellow-500 hover:bg-yellow-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setColor("#8b5cf6")}
                  className="h-8 w-6 p-0 bg-purple-500 hover:bg-purple-600"
                />
              </div> */}

              <Separator orientation="vertical" className="h-6" />

              {/* Clear Formatting */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                className="h-8 w-8 p-0"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        <EditorContent
          editor={editor}
          placeholder={"Add some description about your task..."}
          className={cn(
            "min-h-[120px] bg-pale rounded mt-3 focus:outline-none",
            readOnly && ""
          )}
          onKeyDown={(e) => {
            // Prevent form submit on Cmd/Ctrl+Enter or Enter with meta/ctrl
            if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA")) {
              e.preventDefault();
            }
            // Prevent form submit on Cmd/Ctrl+B, Cmd/Ctrl+I, Cmd/Ctrl+U
            if ((e.metaKey || e.ctrlKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
              e.preventDefault();
            }
          }}
        />
        {placeholder && !value && !editor.isFocused && (
          <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
} 