# Enhanced Time Logging Features

This document describes the new features added to the time logging system, including file attachments, URL support, and rich text editing.

## Features Overview

### 1. Rich Text Editor (Quill)

The time logging form now includes a powerful rich text editor powered by Quill.js, allowing users to create formatted descriptions with:

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headers**: H1, H2, H3 headings
- **Lists**: Bullet points and numbered lists
- **Alignment**: Left, center, right, justify
- **Colors**: Text and background colors
- **Links**: Insert and edit hyperlinks
- **Images**: Embed images directly in descriptions

#### Usage

```tsx
import { RichTextEditor } from "@/components/rich-text-editor";

<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Describe your work..."
  className="min-h-[200px]"
/>;
```

### 2. File Attachments

A comprehensive file attachment system that supports:

- **Drag & Drop**: Intuitive file upload interface
- **Multiple File Types**: Images, PDFs, documents, spreadsheets, presentations
- **File Validation**: Size limits and type checking
- **Progress Tracking**: Real-time upload progress
- **Image Previews**: Automatic preview for image files
- **Error Handling**: Retry failed uploads
- **File Management**: Remove attachments easily

#### Supported File Types

- Images: PNG, JPG, GIF, SVG, etc.
- Documents: PDF, Word (.doc, .docx)
- Spreadsheets: Excel (.xls, .xlsx)
- Presentations: PowerPoint (.ppt, .pptx)
- Text files: .txt, .md, .csv
- Archives: .zip, .rar, .tar

#### Usage

```tsx
import { FileAttachment, type Attachment } from "@/components/file-attachment";

<FileAttachment
  attachments={attachments}
  onAttachmentsChange={setAttachments}
  maxFiles={10}
  maxSize={10 * 1024 * 1024} // 10MB
  acceptedFileTypes={["image/*", "application/pdf", "text/*"]}
  autoUpload={true}
/>;
```

### 3. URL Support

Users can now add external links to their time logs:

- **URL Validation**: Ensures valid URLs are entered
- **Custom Titles**: Add descriptive names for links
- **One-Click Access**: Open links directly from the interface
- **Link Previews**: See the actual URL in the attachment list

#### Usage

```tsx
// URLs are added through the FileAttachment component
// Users can input URL title and URL separately
```

## Implementation Details

### Components

1. **RichTextEditor** (`components/rich-text-editor.tsx`)

   - Wrapper around Quill.js
   - Custom styling to match design system
   - Support for read-only mode
   - Dynamic import to avoid SSR issues

2. **FileAttachment** (`components/file-attachment.tsx`)

   - Drag & drop interface using react-dropzone
   - File upload with progress tracking
   - URL input and validation
   - Image preview generation
   - Error handling and retry functionality

3. **Upload Service** (`services/upload.ts`)
   - File upload API integration
   - Progress tracking
   - File validation utilities
   - Error handling

### API Integration

The system includes enhanced API support for file uploads:

```tsx
// Upload with progress tracking
const uploadResponse = await uploadFile(file, (progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
});

// Multiple file upload
const responses = await uploadMultipleFiles(files, (fileIndex, progress) => {
  console.log(`File ${fileIndex}: ${progress.percentage}%`);
});
```

### Styling

Custom CSS has been added to `app/globals.css` to ensure Quill editor matches the design system:

- Consistent border and background colors
- Proper spacing and typography
- Dark mode support
- Responsive design

## Usage Examples

### Basic Time Log with Rich Text

```tsx
const [description, setDescription] = useState("")
const [attachments, setAttachments] = useState<Attachment[]>([])

// In your form
<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Describe the task you worked on..."
/>

<FileAttachment
  attachments={attachments}
  onAttachmentsChange={setAttachments}
/>
```

### Read-Only Display

```tsx
// For viewing existing time logs
<RichTextEditor
  value={timeLog.description}
  onChange={() => {}} // No-op for read-only
  readOnly={true}
/>

<FileAttachment
  attachments={timeLog.attachments}
  onAttachmentsChange={() => {}} // No-op for read-only
  autoUpload={false}
/>
```

## Configuration Options

### Rich Text Editor

- `value`: Current content (HTML string)
- `onChange`: Callback when content changes
- `placeholder`: Placeholder text
- `readOnly`: Disable editing
- `className`: Additional CSS classes

### File Attachment

- `attachments`: Array of current attachments
- `onAttachmentsChange`: Callback when attachments change
- `maxFiles`: Maximum number of files (default: 10)
- `maxSize`: Maximum file size in bytes (default: 10MB)
- `acceptedFileTypes`: Array of accepted MIME types
- `autoUpload`: Automatically upload files on selection (default: true)

## Demo Page

A comprehensive demo page is available at `/dashboard/employee/time-logs/demo` that showcases all features:

- Interactive rich text editor
- File attachment system
- URL addition
- Live preview of content
- Feature overview

## Backend Integration

To fully implement these features, your backend should support:

1. **File Upload Endpoint**: `/api/upload` for handling file uploads
2. **Time Log Schema**: Updated to include attachments and rich text content
3. **File Storage**: Secure file storage with proper access controls
4. **URL Validation**: Server-side URL validation if needed

### Expected API Response

```json
{
  "id": "file-123",
  "url": "https://storage.example.com/files/document.pdf",
  "filename": "document.pdf",
  "size": 2048000,
  "mimeType": "application/pdf"
}
```

## Security Considerations

- File type validation on both client and server
- File size limits to prevent abuse
- Secure file storage with proper access controls
- URL validation to prevent malicious links
- Content sanitization for rich text content

## Browser Support

- Modern browsers with ES6+ support
- File API support for drag & drop
- Canvas API for image previews
- XMLHttpRequest for upload progress

## Performance

- Lazy loading of Quill editor
- Image compression for previews
- Efficient file handling
- Progress tracking for large uploads
