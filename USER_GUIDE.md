# Task Reporting System (TRS) - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Dashboard Overview](#dashboard-overview)
5. [Time Logging](#time-logging)
6. [Project Management](#project-management)
7. [Task Management](#task-management)
8. [Company Administration](#company-administration)
9. [Reports and Analytics](#reports-and-analytics)
10. [Settings and Preferences](#settings-and-preferences)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

The Task Reporting System (TRS) is a comprehensive time tracking and project management platform designed to help organizations manage their workforce, track time spent on projects, and generate detailed reports. This system supports multiple user roles and provides powerful tools for managing consultants, departments, projects, and tasks.

### Key Features

- **Time Tracking**: Log time spent on tasks with rich text descriptions and file attachments
- **Project Management**: Create and manage projects across departments
- **Task Management**: Track individual tasks and their progress
- **User Management**: Manage consultants, departments, and user roles
- **Reporting**: Generate detailed reports and analytics
- **File Attachments**: Support for documents, images, and URLs in time logs

---

## Getting Started

### First-Time Login

1. Navigate to the TRS login page
2. Enter your email address and password
3. Click "Sign In"
4. You'll be redirected to your role-specific dashboard

### Password Recovery

If you forget your password:

1. Click "Forgot Password" on the login page
2. Enter your email address
3. Check your email for password reset instructions
4. Follow the link to create a new password

---

## User Roles and Permissions

TRS supports five main user roles, each with specific permissions and access levels:

### 1. Super Admin

**Access Level**: System-wide
**Permissions**:

- Manage all companies in the system
- View system-wide analytics and reports
- Manage licenses and packages
- Access revenue and billing information
- View all users across all companies

**Dashboard Features**:

- Total companies overview
- Active licenses management
- Total users across system
- Revenue tracking
- Company management tools

### 2. Company Admin

**Access Level**: Company-wide
**Permissions**:

- Manage departments within their company
- Create and manage projects
- Add and manage consultants
- View company-wide reports and analytics
- Manage company settings
- Access billing and invoice information

**Dashboard Features**:

- Company summary statistics
- Department management
- Project overview
- Consultant management
- Task distribution charts
- Hours tracking by project

### 3. Board Member

**Access Level**: Read-only company access
**Permissions**:

- View company-wide reports and analytics
- Access project and task information
- View consultant information
- No editing or management capabilities

**Dashboard Features**:

- Company overview (read-only)
- Project status charts
- Task distribution analytics
- Consultant performance metrics

### 4. Department Head

**Access Level**: Department-specific
**Permissions**:

- Manage consultants within their department
- View department-specific projects and tasks
- Access department time logs
- Manage department projects

**Dashboard Features**:

- Department statistics
- Team member management
- Project oversight
- Time log review
- Consultant performance tracking

### 5. Consultant/Employee

**Access Level**: Personal
**Permissions**:

- Log time for tasks
- View assigned projects
- Access personal time logs
- Update personal profile
- View completed tasks

**Dashboard Features**:

- Personal time tracking
- Today's and yesterday's tasks
- Hours overview charts
- Project assignments
- Time log management

---

## Dashboard Overview

Each user role has a customized dashboard that provides relevant information and quick access to frequently used features.

### Common Dashboard Elements

#### Navigation Sidebar

The sidebar provides access to all available features based on your role:

- **Dashboard**: Main overview page
- **Time Logs**: Personal time tracking (Consultants/Employees)
- **Projects**: Project management (Company Admins, Department Heads)
- **Tasks**: Task management (Company Admins, Department Heads)
- **Consultants**: User management (Company Admins, Department Heads)
- **Departments**: Department management (Company Admins)
- **Reports**: Analytics and reporting
- **Settings**: Personal and system preferences

#### Summary Cards

Each dashboard displays key metrics in card format:

- **Time Tracking**: Hours logged today, this week, this month
- **Project Status**: Active, completed, and on-hold projects
- **Team Metrics**: Number of consultants, departments, or tasks
- **Performance Indicators**: Trends and percentages

#### Charts and Analytics

Visual representations of data including:

- Bar charts for time distribution
- Pie charts for status breakdowns
- Line charts for trends over time
- Department and project comparisons

---

## Time Logging

Time logging is the core feature of TRS, allowing users to track time spent on various tasks and projects.

### Creating a New Time Log

#### Step-by-Step Process

1. **Navigate to Time Logs**: Click "Time Logs" in the sidebar or use the "Log Time" button
2. **Choose Interface**: Select between "Steps" (guided) or "Full Form" (all fields at once)
3. **Fill Required Information**:
   - **Task Title**: Descriptive name for the work performed
   - **Project**: Select from available projects (optional)
   - **Time Duration**: Enter time in minutes
   - **Status**: Choose "Draft" or "Active"
   - **Description**: Detailed description using rich text editor
   - **Attachments**: Upload files or add URLs (optional)

#### Rich Text Editor Features

The description field includes a powerful rich text editor with:

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headers**: H1, H2, H3 headings
- **Lists**: Bullet points and numbered lists
- **Alignment**: Left, center, right, justify
- **Clear Formatting**: Remove all formatting

#### File Attachments

Support for various file types:

- **Images**: PNG, JPG, GIF, SVG
- **Documents**: PDF, Word documents
- **Spreadsheets**: Excel files
- **Presentations**: PowerPoint files
- **Text Files**: TXT, MD, CSV
- **Archives**: ZIP, RAR, TAR

**File Upload Process**:

1. Drag and drop files onto the upload area
2. Or click to browse and select files
3. Files are automatically uploaded with progress tracking
4. Preview images are generated automatically
5. Remove files by clicking the trash icon

#### URL Links

Add external links to your time logs:

1. Enter the URL in the URL field
2. Optionally add a custom title
3. Click "Add" to include the link
4. Links open in new tabs when clicked

### Time Log Status

#### Draft Status

- Time logs saved as drafts are not yet finalized
- Can be edited and modified
- Automatically published by midnight
- Useful for work-in-progress entries

#### Active Status

- Time logs marked as active are finalized
- Cannot be edited (except by administrators)
- Counted toward billable hours
- Used for invoicing and reporting

### Managing Time Logs

#### Viewing Time Logs

- **List View**: See all time logs in a table format
- **Filtering**: Filter by date range, project, or status
- **Search**: Search by task title or description
- **Pagination**: Navigate through large numbers of logs

#### Editing Time Logs

- Only draft time logs can be edited
- Click the edit icon next to any draft log
- Modify any field including attachments
- Save changes to update the log

#### Publishing Drafts

- **Individual**: Click the upload icon to publish a single draft
- **Bulk**: Use "Publish All Drafts" to publish all draft logs at once
- Published logs become active and cannot be edited

#### Deleting Time Logs

- Only draft time logs can be deleted
- Click the trash icon to delete a log
- Confirm deletion in the popup dialog
- Deleted logs cannot be recovered

### Time Log Preferences

#### Interface Preferences

- **Stepped Interface**: Guided step-by-step process
- **Full Form**: All fields visible at once
- **Stay on Form**: Remain on the form after submission for multiple entries

#### Feature Toggles

- **Show Projects**: Enable/disable project selection
- **Show Attachments**: Enable/disable file uploads
- **Show URLs**: Enable/disable URL links

---

## Project Management

Project management features allow administrators to create, organize, and track projects across departments.

### Creating Projects

#### Project Information

- **Project Name**: Descriptive title for the project
- **Department**: Select the responsible department
- **Project Lead**: Assign a team member as project lead
- **Deadline**: Set project completion date
- **Description**: Detailed project description
- **Status**: Initial project status (Planning, Active, On Hold, Completed)

#### Project Status Management

- **Planning**: Project in initial planning phase
- **Active**: Project currently in progress
- **On Hold**: Project temporarily paused
- **Completed**: Project finished successfully

### Managing Projects

#### Project Dashboard

- **Overview Cards**: Total, active, completed, and on-hold projects
- **Status Chart**: Visual distribution of project statuses
- **Timeline Chart**: Projects organized by completion percentage
- **Progress Tracking**: Visual progress bars for each project

#### Project Actions

- **Edit**: Modify project details and settings
- **Delete**: Remove project (with confirmation)
- **View Tasks**: See all tasks associated with the project
- **Assign Team**: Add consultants to the project

#### Project Filtering and Search

- **Search**: Find projects by name or lead
- **Filter by Status**: Show only projects with specific status
- **Filter by Department**: View projects by department
- **Sort Options**: Sort by name, deadline, or progress

---

## Task Management

Task management provides detailed tracking of individual work items within projects.

### Task Overview

#### Task Statistics

- **Total Tasks**: Count of all tasks in the system
- **Active Tasks**: Currently in-progress tasks
- **Draft Tasks**: Tasks saved as drafts
- **Total Hours**: Cumulative time logged across all tasks

#### Task Status Distribution

- **Active**: Tasks currently being worked on
- **Draft**: Tasks saved but not yet active
- **Completed**: Finished tasks
- **Overdue**: Tasks past their deadline

### Task Management Features

#### Task Details

Each task includes:

- **Task Title**: Descriptive name
- **Project**: Associated project
- **Department**: Responsible department
- **Owner**: Assigned consultant
- **Duration**: Time spent on the task
- **Status**: Current task status
- **Description**: Detailed task information
- **Attachments**: Files and links associated with the task

#### Task Actions

- **View Details**: Full task information in modal
- **Edit**: Modify task details (administrators only)
- **Delete**: Remove task (administrators only)
- **Export**: Generate PDF reports

#### Task Filtering

- **Search**: Find tasks by title or description
- **Department Filter**: Show tasks by department
- **Project Filter**: Filter by specific project
- **Duration Filter**: Filter by time spent ranges
- **Status Filter**: Show tasks by status

### Task Detail Modal

#### Comprehensive Task View

The task detail modal provides:

- **Full Task Information**: Complete task details
- **Rich Text Description**: Formatted task description
- **File Attachments**: View and download attached files
- **URL Links**: Access external links
- **Project Information**: Associated project details
- **Department Information**: Department context
- **Timeline**: Creation and update timestamps

#### Attachment Handling

- **Image Previews**: Automatic image thumbnails
- **PDF Viewing**: Direct PDF viewing capability
- **File Downloads**: Download any attached file
- **URL Access**: Open external links in new tabs

---

## Company Administration

Company administration features are available to Company Admins and Department Heads for managing organizational structure and personnel.

### Department Management

#### Creating Departments

1. Navigate to "Departments" in the sidebar
2. Click "Add Department"
3. Fill in department information:
   - **Department Name**: Unique department identifier
   - **Department Head**: Assign a team member as head
   - **Description**: Department purpose and responsibilities
   - **Status**: Active or Inactive

#### Department Statistics

- **Total Departments**: Number of active departments
- **Total Employees**: Count across all departments
- **Average Team Size**: Employees per department
- **Department Distribution**: Visual chart of employee distribution

#### Department Actions

- **Edit**: Modify department details
- **Delete**: Remove department (with confirmation)
- **View Projects**: See department projects
- **Manage Team**: Add/remove consultants

### Consultant Management

#### Adding Consultants

1. Navigate to "Consultants" in the sidebar
2. Click "Add Consultant"
3. Complete consultant information:
   - **Personal Details**: Name, email, phone, address
   - **Employment Info**: Job title, department, role
   - **Bank Details**: Account information for payments
   - **Next of Kin**: Emergency contact information
   - **Office Days**: Work schedule preferences

#### Consultant Dashboard

- **Total Consultants**: Count of all consultants
- **Active Consultants**: Currently active team members
- **On Leave**: Consultants currently on leave
- **New Hires**: Consultants added in last 30 days

#### Consultant Actions

- **View Details**: Comprehensive consultant information
- **Edit**: Modify consultant information
- **Status Management**: Activate, deactivate, or set on leave
- **Time Log Review**: View consultant's time logs
- **Performance Tracking**: Monitor hours and productivity

#### Consultant Detail Modal

The consultant detail modal includes multiple sections:

##### Overview Tab

- **Hours Summary**: Today, this week, this month, last month
- **Trend Indicators**: Performance trends with visual indicators
- **Week Distribution Chart**: Hours logged by day of week
- **Performance Metrics**: Productivity and efficiency data

##### Logs by Range Tab

- **Date Range Selection**: Choose specific time periods
- **Quick Actions**: "Today" button for current day
- **Time Log Table**: Detailed log entries for selected period
- **Summary Statistics**: Total hours and log count
- **Export Capabilities**: Generate reports for the period

##### Personal Tab

- **Profile Information**: Complete personal details
- **Contact Information**: Email, phone, address
- **Employment Details**: Job title, department, role
- **Status Information**: Current employment status
- **ID Attachments**: Uploaded identification documents
- **Gross Pay**: Monthly salary information
- **Office Days**: Work schedule preferences

##### Next of Kin Tab

- **Emergency Contact**: Name and relationship
- **Contact Information**: Phone and email
- **Relationship**: Family relationship details

##### Bank Details Tab

- **Account Information**: Account name and number
- **Bank Details**: Bank name, branch, SWIFT code
- **Payment Information**: Complete banking details

### Consultant Status Management

#### Status Types

- **Active**: Currently working and available
- **Inactive**: Not currently working
- **On Leave**: Temporarily unavailable

#### Status Change Process

1. Click the status icon next to consultant name
2. Confirm status change in dialog
3. Status updates immediately
4. Consultant receives notification of change

---

## Reports and Analytics

TRS provides comprehensive reporting and analytics capabilities for different user roles.

### Available Reports

#### Time Log Reports

- **Individual Reports**: Personal time tracking summaries
- **Team Reports**: Department or project team summaries
- **Company Reports**: Organization-wide time tracking
- **Date Range Reports**: Customizable time periods

#### Project Reports

- **Project Progress**: Completion status and timelines
- **Project Hours**: Time spent on each project
- **Project Performance**: Efficiency and productivity metrics
- **Project Comparison**: Side-by-side project analysis

#### Consultant Reports

- **Performance Reports**: Individual consultant productivity
- **Hours Distribution**: Time allocation across projects
- **Attendance Reports**: Work patterns and consistency
- **Billing Reports**: Billable hours and rates

### Report Features

#### Export Options

- **PDF Generation**: Professional formatted reports
- **Date Range Selection**: Custom time periods
- **Filter Options**: Department, project, consultant filters
- **Summary Statistics**: Key metrics and totals

#### Visual Analytics

- **Charts and Graphs**: Visual data representation
- **Trend Analysis**: Performance over time
- **Comparative Analysis**: Department and project comparisons
- **Distribution Charts**: Work allocation visualization

---

## Settings and Preferences

TRS offers comprehensive settings and preferences for personalization and system configuration.

### Personal Settings

#### Profile Management

- **Personal Information**: Name, email, phone
- **Job Information**: Title, department, bio
- **Profile Image**: Upload profile picture
- **Password Management**: Change password securely

#### Time Logging Preferences

- **Interface Mode**: Stepped vs. full form
- **Feature Toggles**: Enable/disable attachments, URLs, projects
- **Stay on Form**: Remain on form after submission
- **Default Values**: Set common project and task defaults

### Company Settings (Company Admins Only)

#### Company Information

- **Company Name**: Official company name
- **Currency Settings**: Default currency for billing
- **Floating Point**: Enable decimal amounts on invoices
- **Company Logo**: Upload company branding

#### System Preferences

- **Time Tracking**: Default time tracking settings
- **Project Management**: Project creation and management rules
- **User Management**: Consultant onboarding and management
- **Reporting**: Default report settings and formats

### Notification Settings

#### Email Notifications

- **Time Log Reminders**: Daily/weekly time logging reminders
- **Project Updates**: Project status changes
- **Task Assignments**: New task assignments
- **System Alerts**: Important system notifications

#### Dashboard Preferences

- **Default View**: Preferred dashboard layout
- **Chart Preferences**: Favorite chart types
- **Quick Actions**: Frequently used features
- **Widget Customization**: Dashboard widget arrangement

---

## Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Issue**: Cannot log in with correct credentials
**Solutions**:

- Check email address spelling
- Ensure Caps Lock is off
- Try password reset if forgotten
- Clear browser cache and cookies
- Contact administrator if account is locked

#### Time Logging Issues

**Issue**: Cannot create or save time logs
**Solutions**:

- Check internet connection
- Ensure all required fields are filled
- Verify file upload size limits (10MB max)
- Try refreshing the page
- Clear browser cache

#### File Upload Problems

**Issue**: Files not uploading or attaching
**Solutions**:

- Check file size (must be under 10MB)
- Verify file type is supported
- Ensure stable internet connection
- Try uploading one file at a time
- Check browser compatibility

#### Performance Issues

**Issue**: Slow loading or unresponsive interface
**Solutions**:

- Refresh the browser page
- Clear browser cache and cookies
- Check internet connection speed
- Close unnecessary browser tabs
- Try a different browser

#### Data Not Updating

**Issue**: Changes not reflecting in the system
**Solutions**:

- Refresh the page
- Check internet connection
- Wait a few moments for server sync
- Log out and log back in
- Clear browser cache

### Browser Compatibility

#### Supported Browsers

- **Chrome**: Version 90 or higher (recommended)
- **Firefox**: Version 88 or higher
- **Safari**: Version 14 or higher
- **Edge**: Version 90 or higher

#### Browser Requirements

- **JavaScript**: Must be enabled
- **Cookies**: Must be enabled
- **Local Storage**: Required for preferences
- **File API**: Required for file uploads
- **Canvas API**: Required for image previews

### Getting Help

#### Support Channels

- **Email Support**: Contact your system administrator
- **Documentation**: Refer to this user guide
- **Training**: Request training sessions from administrators
- **Feedback**: Provide feedback through the system

#### Best Practices

- **Regular Backups**: Ensure data is regularly backed up
- **Secure Passwords**: Use strong, unique passwords
- **Regular Updates**: Keep browsers updated
- **Data Validation**: Verify information before submitting
- **File Management**: Organize attachments logically

---

## Conclusion

The Task Reporting System (TRS) provides a comprehensive solution for time tracking, project management, and organizational oversight. By following this user guide, you can effectively utilize all features of the system to improve productivity, track progress, and generate valuable insights for your organization.

Remember to:

- Log time regularly and accurately
- Use descriptive task titles and detailed descriptions
- Attach relevant files and links to time logs
- Review reports regularly for insights
- Keep your profile information up to date
- Contact your administrator for any system issues

For additional support or questions not covered in this guide, please contact your system administrator or refer to the system's built-in help features.

