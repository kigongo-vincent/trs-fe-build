# Task Reporting System (TRS) - Comprehensive Role-Based User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Consultant Role - Complete Guide](#consultant-role---complete-guide)
4. [Department Head Role - Complete Guide](#department-head-role---complete-guide)
5. [Company Admin Role - Complete Guide](#company-admin-role---complete-guide)
6. [Board Member Role - Complete Guide](#board-member-role---complete-guide)
7. [Super Admin Role - Complete Guide](#super-admin-role---complete-guide)
8. [Common Features Across All Roles](#common-features-across-all-roles)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

The Task Reporting System (TRS) is a comprehensive time tracking and project management platform designed to help organizations manage their workforce, track time spent on projects, and generate detailed reports. This system supports five distinct user roles, each with specific permissions and capabilities tailored to their responsibilities.

### Key Features Overview

- **Time Tracking**: Log time spent on tasks with rich text descriptions and file attachments
- **Project Management**: Create and manage projects across departments
- **Task Management**: Track individual tasks and their progress
- **User Management**: Manage consultants, departments, and user roles
- **Reporting**: Generate detailed reports and analytics
- **File Attachments**: Support for documents, images, and URLs in time logs
- **Invoice Management**: Track billing and generate invoices
- **Analytics**: Comprehensive dashboards with charts and metrics

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

### Role-Based Access

The system automatically redirects you to the appropriate dashboard based on your assigned role:

- **Consultant**: Main consultant dashboard
- **Department Head**: Department head dashboard
- **Company Admin**: Company administration dashboard
- **Board Member**: Company administration dashboard (read-only access)
- **Super Admin**: Super admin dashboard

---

# Consultant Role - Complete Guide

## Overview

Consultants are the primary users who log time and track their work. They have access to personal time tracking, project assignments, and invoice management features.

## Dashboard Features

### Main Dashboard

The consultant dashboard provides a comprehensive overview of personal time tracking and work assignments.

#### Summary Cards

- **Hours Today**: Total hours logged for the current day
- **Hours This Week**: Cumulative hours for the current week
- **Hours This Month**: Total hours for the current month
- **Billable Hours**: Hours that can be billed to clients
- **Draft Logs**: Number of time logs saved as drafts

#### Task Tabs

- **Today's Tasks**: List of tasks logged today with time spent
- **Yesterday's Tasks**: Previous day's logged tasks for reference

#### Charts and Analytics

- **Consultant Hours Chart**: Visual representation of hours logged over the past week
- **Trend Indicators**: Shows if hours are trending up or down compared to previous periods

## Time Logging System

### Creating New Time Logs

To create a new time log, click on "Time Logs" in the sidebar, then click the "Log Time" button.

#### Interface Options

The system offers two interface modes that can be toggled in preferences:

**1. Stepped Interface (Default)**
A guided 5-step process:

- **Step 1 - Basic Info**: Task title and project selection
- **Step 2 - Time & Status**: Duration in minutes and status (draft/active)
- **Step 3 - Description**: Rich text description using the advanced editor
- **Step 4 - Attachments**: File uploads and URL links
- **Step 5 - Review**: Final review before submission

**2. Full Form Interface**
All fields displayed simultaneously for faster entry

#### Form Fields Explained

**Task Title**

- Required field for descriptive task name
- Should clearly identify the work performed
- Examples: "Client Meeting - Project Alpha", "Code Review - User Authentication"

**Project Selection**

- Optional dropdown of available projects
- Only shows projects where the consultant is assigned
- Can be disabled in preferences if not needed

**Time Duration**

- Enter time in minutes (minimum 1 minute)
- System automatically converts to hours and minutes display
- Example: 90 minutes shows as "1h 30m"

**Status Selection**

- **Draft**: Work-in-progress, can be edited later
- **Active**: Finalized time log, cannot be edited
- Draft logs are automatically published at midnight

**Rich Text Description**
Advanced text editor with formatting options:

- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headers**: H1, H2, H3 for structured content
- **Lists**: Bullet points and numbered lists
- **Alignment**: Left, center, right, justify
- **Clear Formatting**: Remove all formatting
- **Links**: Insert hyperlinks
- **Images**: Insert images directly

**File Attachments**
Comprehensive file upload system:

- **Supported Formats**:
  - Images: PNG, JPG, GIF, SVG
  - Documents: PDF, Word documents
  - Spreadsheets: Excel files
  - Presentations: PowerPoint files
  - Text Files: TXT, MD, CSV
  - Archives: ZIP, RAR, TAR
- **Upload Methods**:
  - Drag and drop files onto upload area
  - Click to browse and select files
- **Features**:
  - Automatic file upload with progress tracking
  - Image preview generation
  - File size validation (10MB maximum)
  - Remove files with trash icon
  - View/download attached files

**URL Links**
Add external references:

- Enter URL in the URL field
- Optionally add custom title/name
- Links open in new tabs when accessed
- Useful for referencing external resources, documentation, or tools

#### Form Preferences

Customizable settings stored in local storage:

- **Enable Steppers**: Toggle between stepped and full form
- **Show Projects**: Enable/disable project selection
- **Show Attachments**: Enable/disable file uploads
- **Show URLs**: Enable/disable URL links
- **Stay on Form**: Remain on form after submission for multiple entries

### Managing Time Logs

To manage your time logs, click on "Time Logs" in the sidebar.

#### Time Log List View

Comprehensive table showing all time logs with:

- **Task Title**: Name of the logged task
- **Project**: Associated project (if any)
- **Duration**: Time spent in hours and minutes
- **Status**: Draft or Active with color-coded badges
- **Date**: When the time was logged
- **Actions**: View, edit, delete, or publish options

#### Filtering and Search

- **Search**: Find logs by task title or description
- **Date Range**: Filter by specific date ranges
- **Project Filter**: Show logs for specific projects
- **Status Filter**: Filter by draft or active status
- **Quick Date Filters**: Today, This Week, This Month

#### Pagination

- **Page Size**: Choose 10, 20, 50, or 100 logs per page
- **Navigation**: Previous/Next buttons and page numbers
- **Total Count**: Shows total number of logs

#### Time Log Actions

**View Details**

- Opens detailed modal with full task information
- Shows rich text description with formatting
- Displays all file attachments with previews
- Lists all URL links
- Shows project and department information
- Displays creation and update timestamps

**Edit Time Log**

- Only available for draft logs
- Opens edit dialog with all original fields
- Maintains rich text formatting
- Allows modification of attachments and URLs
- Saves changes while preserving log history

**Delete Time Log**

- Only available for draft logs
- Shows confirmation dialog before deletion
- Permanently removes the log from the system
- Cannot be undone

**Publish Draft**

- Converts draft to active status
- Individual publish: Click upload icon on specific log
- Bulk publish: "Publish All Drafts" button
- Published logs cannot be edited
- Used for finalizing work entries

#### Export Features

- **PDF Export**: Generate professional PDF reports
- **Date Range Selection**: Export logs for specific periods
- **Filtered Export**: Export only filtered results
- **Summary Statistics**: Include totals and summaries

### Project Management

To view your projects, click on "Projects" in the sidebar.

#### Project Overview

Shows projects where the consultant is assigned as project lead:

- **Project Name**: Title of the project
- **Department**: Responsible department
- **Status**: Current project status
- **Progress**: Completion percentage with visual progress bar

#### Project Status Management

**Available Statuses**:

- **Not Started**: Project in planning phase (0% complete)
- **In Progress**: Active development (1-99% complete)
- **Completed**: Project finished (100% complete)
- **On Hold**: Temporarily paused

#### Editing Projects

- Click edit icon to modify project details
- **Status Selection**: Choose from dropdown menu
- **Progress Slider**: Set completion percentage
- **On Hold Toggle**: Lock project status
- **Save Changes**: Update project information

#### Project Detail View

Individual project page with:

- **Project Information**: Name, description, department
- **Status Management**: Current status and progress
- **Team Members**: Assigned consultants
- **Timeline**: Project milestones and deadlines
- **Tasks**: Associated tasks and their status

### Invoice Management

To view your invoices, click on "Invoices" in the sidebar.

#### Invoice Overview

Personal invoice tracking and management:

- **Invoice Summary**: Total invoices, amounts, and status
- **Monthly Summary**: Income breakdown by month
- **Payment Status**: Pending, paid, processing, overdue

#### Invoice Details

- **Invoice Number**: Unique identifier
- **Amount**: Total invoice value
- **Status**: Current payment status
- **Due Date**: Payment deadline
- **Description**: Invoice details and line items

#### Invoice Actions

- **View Details**: Complete invoice information
- **Download PDF**: Generate invoice PDF
- **Print Invoice**: Direct printing option
- **Status Tracking**: Monitor payment progress

#### Monthly Salary Chart

Visual representation of:

- **Monthly Income**: Salary trends over time
- **Payment History**: Historical payment data
- **Projected Income**: Estimated future earnings

### Time Log Demo

To explore the time logging features, click on "Time Logs" in the sidebar, then click "Demo" to access the interactive demonstration.

#### Feature Demonstration

Interactive demo showcasing:

- **Rich Text Editor**: All formatting capabilities
- **File Attachments**: Upload and preview functionality
- **URL Management**: Adding and managing links
- **Form Validation**: Error handling and validation
- **Interface Options**: Stepped vs. full form comparison

#### Learning Resources

- **Feature Overview**: Detailed explanation of new features
- **Usage Examples**: Practical examples and use cases
- **Best Practices**: Recommendations for effective time logging
- **Troubleshooting**: Common issues and solutions

---

# Department Head Role - Complete Guide

## Overview

Department Heads manage consultants within their department and oversee department-specific projects and tasks. They have elevated permissions compared to consultants but limited to their department scope.

## Dashboard Features

### Main Dashboard

Comprehensive overview of department performance and team management.

#### Summary Cards

- **Projects**: Total projects in the department
- **Tasks**: Number of tasks assigned to department
- **Team Members**: Count of consultants in department
- **Hours Logged**: Total hours tracked by department

#### Charts and Analytics

- **Hours Overview (Bar Chart)**: Weekly hours distribution
- **Task Status (Pie Chart)**: Breakdown of task completion status
- **Department Performance**: Visual metrics and trends

## Consultant Management

To manage consultants in your department, click on "Consultants" in the sidebar.

### Consultant Overview

Complete management of department consultants with comprehensive tracking.

#### Summary Statistics

- **Total Consultants**: Count of all department consultants
- **Active Consultants**: Currently working team members
- **On Leave**: Consultants temporarily unavailable
- **New Hires**: Recently added consultants

#### Consultant List View

Detailed table showing:

- **Profile Information**: Name, email, phone, department
- **Status**: Active, inactive, or on leave
- **Hours Summary**: Today, this week, this month
- **Performance**: Trend indicators and metrics
- **Actions**: View details, edit, status management

#### Consultant Detail Modal

Comprehensive consultant information in multiple tabs:

**Overview Tab**

- **Hours Summary**: Today, this week, this month, last month
- **Trend Indicators**: Performance trends with visual indicators
- **Week Distribution Chart**: Hours logged by day of week
- **Performance Metrics**: Productivity and efficiency data

**Logs by Range Tab**

- **Date Range Selection**: Choose specific time periods
- **Quick Actions**: "Today" button for current day
- **Time Log Table**: Detailed log entries for selected period
- **Summary Statistics**: Total hours and log count
- **Export Capabilities**: Generate reports for the period

**Personal Tab**

- **Profile Information**: Complete personal details
- **Contact Information**: Email, phone, address
- **Employment Details**: Job title, department, role
- **Status Information**: Current employment status
- **ID Attachments**: Uploaded identification documents
- **Gross Pay**: Monthly salary information
- **Office Days**: Work schedule preferences

**Next of Kin Tab**

- **Emergency Contact**: Name and relationship
- **Contact Information**: Phone and email
- **Relationship**: Family relationship details

**Bank Details Tab**

- **Account Information**: Account name and number
- **Bank Details**: Bank name, branch, SWIFT code
- **Payment Information**: Complete banking details

#### Consultant Actions

**Status Management**

- **Activate**: Set consultant as active and available
- **Deactivate**: Temporarily disable consultant access
- **Set On Leave**: Mark consultant as temporarily unavailable
- **Status Change Confirmation**: Dialog for status changes

**Profile Editing**

- **Personal Information**: Update contact details
- **Employment Details**: Modify job title and department
- **Bank Information**: Update payment details
- **Emergency Contacts**: Manage next of kin information

### Adding New Consultants

To add a new consultant to your department, click on "Consultants" in the sidebar, then click "Add Consultant".

#### Consultant Registration Form

Comprehensive form for adding new team members:

**Personal Information**

- **Full Name**: First and last name
- **Email Address**: Primary contact email
- **Phone Number**: Contact phone number
- **Address**: Complete address information
- **Date of Birth**: Birth date for records

**Employment Details**

- **Job Title**: Position within department
- **Department**: Assigned department
- **Role**: Consultant or Employee
- **Start Date**: Employment start date
- **Office Days**: Work schedule preferences

**Bank Information**

- **Account Name**: Bank account holder name
- **Account Number**: Bank account number
- **Bank Name**: Financial institution
- **Branch**: Bank branch location
- **SWIFT Code**: International bank code

**Emergency Contact**

- **Next of Kin Name**: Emergency contact person
- **Relationship**: Family relationship
- **Contact Phone**: Emergency phone number
- **Contact Email**: Emergency email address

**Document Upload**

- **ID Documents**: Upload identification
- **Employment Contract**: Upload contract documents
- **Bank Statements**: Upload banking documents

## Task Management

To manage department tasks, click on "Tasks" in the sidebar.

### Task Overview

Comprehensive task management for department tasks.

#### Summary Statistics

- **Total Tasks**: Count of all department tasks
- **Active Tasks**: Currently in-progress tasks
- **Draft Tasks**: Tasks saved as drafts
- **Total Hours**: Cumulative time across all tasks

#### Task List View

Detailed table showing:

- **Task Title**: Name of the task
- **Project**: Associated project
- **Department**: Responsible department
- **Owner**: Assigned consultant
- **Duration**: Time spent on task
- **Status**: Current task status
- **Actions**: View details, edit, delete

#### Task Filtering

- **Search**: Find tasks by title or description
- **Department Filter**: Show tasks by department
- **Project Filter**: Filter by specific project
- **Duration Filter**: Filter by time spent ranges
- **Status Filter**: Show tasks by status

#### Task Detail Modal

Comprehensive task information:

- **Full Task Information**: Complete task details
- **Rich Text Description**: Formatted task description
- **File Attachments**: View and download attached files
- **URL Links**: Access external links
- **Project Information**: Associated project details
- **Department Information**: Department context
- **Timeline**: Creation and update timestamps

#### Task Actions

**View Details**

- Complete task information in modal
- Rich text description with formatting
- File attachments with previews
- URL links and external references
- Project and department context

**Edit Tasks**

- Modify task details and descriptions
- Update project assignments
- Change task status
- Manage attachments and links
- Update department assignments

**Delete Tasks**

- Remove tasks from system
- Confirmation dialog for safety
- Permanent deletion with warning
- Cannot be undone

#### Task Charts

- **Task Status Chart**: Visual breakdown of task completion
- **Tasks by Department Chart**: Department task distribution
- **Performance Metrics**: Task completion rates and trends

---

# Company Admin Role - Complete Guide

## Overview

Company Admins have full access to manage all aspects of their company within the TRS system. They can manage departments, projects, consultants, tasks, and generate comprehensive reports.

## Dashboard Features

### Main Dashboard

Comprehensive company overview with key metrics and analytics.

#### Summary Cards

- **Departments**: Total number of departments
- **Projects**: Count of all company projects
- **Consultants**: Total consultants across company
- **Hours Logged**: Cumulative hours for entire company

#### Charts and Analytics

- **Hours by Project Chart**: Time distribution across projects
- **Task Distribution Chart**: Task allocation visualization
- **Company Performance**: Overall company metrics
- **Department Comparison**: Performance across departments

## Project Management

To manage company projects, click on "Projects" in the sidebar.

### Project Overview

Complete project management across all departments.

#### Summary Statistics

- **Total Projects**: Count of all company projects
- **Active Projects**: Currently in-progress projects
- **Completed Projects**: Finished projects
- **On Hold Projects**: Temporarily paused projects

#### Project List View

Comprehensive table showing:

- **Project Name**: Title of the project
- **Department**: Responsible department
- **Project Lead**: Assigned team member
- **Status**: Current project status
- **Progress**: Completion percentage
- **Deadline**: Project completion date
- **Actions**: Edit, delete, view details

#### Project Charts

- **Project Status Chart**: Visual distribution of project statuses
- **Project Timeline Chart**: Projects organized by completion percentage
- **Department Projects**: Projects grouped by department

#### Project Actions

**Add New Project**
To add a new project, click the "Add Project" button on the projects page.

- **Project Information**: Name, description, department
- **Project Lead**: Assign responsible team member
- **Timeline**: Start date and deadline
- **Status**: Initial project status
- **Team Assignment**: Add consultants to project

**Edit Project**

- Modify project details and settings
- Update project lead assignment
- Change project status and progress
- Manage team members
- Update timeline and deadlines

**Delete Project**

- Remove project from system
- Confirmation dialog for safety
- Permanent deletion with warning
- Cannot be undone

#### Project Filtering

- **Search**: Find projects by name or lead
- **Filter by Status**: Show projects with specific status
- **Filter by Department**: View projects by department
- **Sort Options**: Sort by name, deadline, or progress

## Task Management

To manage company tasks, click on "Tasks" in the sidebar.

### Task Overview

Comprehensive task management across all departments and projects.

#### Summary Statistics

- **Total Tasks**: Count of all company tasks
- **Active Tasks**: Currently in-progress tasks
- **Draft Tasks**: Tasks saved as drafts
- **Total Hours**: Cumulative time across all tasks

#### Task List View

Detailed table showing:

- **Task Title**: Name of the task
- **Project**: Associated project
- **Department**: Responsible department
- **Owner**: Assigned consultant
- **Duration**: Time spent on task
- **Status**: Current task status
- **Actions**: View details, edit, delete

#### Task Charts

- **Task Status Chart**: Visual breakdown of task completion
- **Tasks by Department Chart**: Department task distribution
- **Performance Metrics**: Task completion rates and trends

#### Task Actions

**View Task Details**

- Complete task information in modal
- Rich text description with formatting
- File attachments with previews
- URL links and external references
- Project and department context

**Edit Tasks**

- Modify task details and descriptions
- Update project assignments
- Change task status
- Manage attachments and links
- Update department assignments

**Delete Tasks**

- Remove tasks from system
- Confirmation dialog for safety
- Permanent deletion with warning
- Cannot be undone

#### Task Filtering

- **Search**: Find tasks by title or description
- **Department Filter**: Show tasks by department
- **Project Filter**: Filter by specific project
- **Duration Filter**: Filter by time spent ranges
- **Status Filter**: Show tasks by status

## Consultant Management

To manage company consultants, click on "Consultants" in the sidebar.

### Consultant Overview

Complete management of all company consultants.

#### Summary Statistics

- **Total Consultants**: Count of all company consultants
- **Active Consultants**: Currently working team members
- **On Leave**: Consultants temporarily unavailable
- **New Hires**: Recently added consultants

#### Consultant List View

Detailed table showing:

- **Profile Information**: Name, email, phone, department
- **Status**: Active, inactive, or on leave
- **Hours Summary**: Today, this week, this month
- **Performance**: Trend indicators and metrics
- **Actions**: View details, edit, status management

#### Consultant Detail Modal

Comprehensive consultant information in multiple tabs:

**Overview Tab**

- **Hours Summary**: Today, this week, this month, last month
- **Trend Indicators**: Performance trends with visual indicators
- **Week Distribution Chart**: Hours logged by day of week
- **Performance Metrics**: Productivity and efficiency data

**Logs by Range Tab**

- **Date Range Selection**: Choose specific time periods
- **Quick Actions**: "Today" button for current day
- **Time Log Table**: Detailed log entries for selected period
- **Summary Statistics**: Total hours and log count
- **Export Capabilities**: Generate reports for the period

**Personal Tab**

- **Profile Information**: Complete personal details
- **Contact Information**: Email, phone, address
- **Employment Details**: Job title, department, role
- **Status Information**: Current employment status
- **ID Attachments**: Uploaded identification documents
- **Gross Pay**: Monthly salary information
- **Office Days**: Work schedule preferences

**Next of Kin Tab**

- **Emergency Contact**: Name and relationship
- **Contact Information**: Phone and email
- **Relationship**: Family relationship details

**Bank Details Tab**

- **Account Information**: Account name and number
- **Bank Details**: Bank name, branch, SWIFT code
- **Payment Information**: Complete banking details

#### Consultant Actions

**Status Management**

- **Activate**: Set consultant as active and available
- **Deactivate**: Temporarily disable consultant access
- **Set On Leave**: Mark consultant as temporarily unavailable
- **Status Change Confirmation**: Dialog for status changes

**Profile Editing**

- **Personal Information**: Update contact details
- **Employment Details**: Modify job title and department
- **Bank Information**: Update payment details
- **Emergency Contacts**: Manage next of kin information

#### Consultant Charts

- **Consultants by Department Chart**: Department distribution
- **Performance Metrics**: Individual and team performance
- **Hours Distribution**: Time allocation across projects

## Department Management

To manage company departments, click on "Departments" in the sidebar.

### Department Overview

Complete management of company departments.

#### Summary Statistics

- **Total Departments**: Number of active departments
- **Total Employees**: Count across all departments
- **Average Team Size**: Employees per department
- **Department Distribution**: Visual chart of employee distribution

#### Department List View

Detailed table showing:

- **Department Name**: Name of the department
- **Department Head**: Assigned head of department
- **Employee Count**: Number of consultants in department
- **Status**: Active or inactive
- **Actions**: Edit, delete, view details

#### Department Actions

**Add New Department**
To add a new department, click the "Add Department" button on the departments page.

- **Department Information**: Name and description
- **Department Head**: Assign responsible team member
- **Status**: Active or inactive
- **Description**: Department purpose and responsibilities

**Edit Department**

- Modify department details
- Update department head assignment
- Change department status
- Update description and purpose

**Delete Department**

- Remove department from system
- Confirmation dialog for safety
- Permanent deletion with warning
- Cannot be undone

#### Department Charts

- **Department Distribution Chart**: Visual employee distribution
- **Performance Metrics**: Department productivity and efficiency
- **Team Size Comparison**: Department size analysis

## Package Subscription Management

To manage your company's package subscription, click on "Packages" in the sidebar.

### Package Overview

Complete package subscription management and billing.

#### Current Package Information

- **Package Name**: Current subscription package
- **Price**: Monthly or yearly cost
- **Duration**: Billing cycle (monthly/yearly)
- **User Limit**: Maximum users allowed
- **Expiry Date**: License expiration date
- **Status**: Active, expired, or pending

#### Available Packages

View all available subscription packages:

- **Package Details**: Features and benefits
- **Pricing**: Cost comparison
- **User Limits**: Maximum user restrictions
- **Features**: Included functionality

#### Package Actions

**Upgrade Package**
To upgrade your subscription, click the "Upgrade" button next to any available package.

- **Package Selection**: Choose new package
- **Billing Cycle**: Select monthly or yearly
- **Payment Method**: Choose payment option
- **Confirmation**: Review and confirm upgrade

**Downgrade Package**
To downgrade your subscription:

- **Package Selection**: Choose lower-tier package
- **Effective Date**: When downgrade takes effect
- **Feature Impact**: Review feature limitations
- **Confirmation**: Confirm downgrade

**Cancel Subscription**
To cancel your subscription:

- **Cancellation Reason**: Select reason for cancellation
- **Effective Date**: When cancellation takes effect
- **Data Retention**: Confirm data handling
- **Confirmation**: Final cancellation confirmation

#### Billing History

View complete billing transaction history:

- **Transaction Date**: When payment was made
- **Amount**: Payment amount
- **Status**: Payment status
- **Invoice**: Link to invoice PDF
- **Payment Method**: How payment was made

#### License Key Management

- **Current License**: Active license key
- **License Status**: Active, expired, or suspended
- **Renewal Date**: When license needs renewal
- **Usage Statistics**: License usage metrics

## Invoice Management

To manage company invoices, click on "Invoices" in the sidebar.

### Invoice Overview

Comprehensive invoice management and billing with approval workflow.

#### Invoice Summary

- **Total Invoices**: Count of all invoices
- **Pending Invoices**: Unpaid invoices awaiting approval
- **Approved Invoices**: Invoices approved for payment
- **Paid Invoices**: Completed payments
- **Overdue Invoices**: Past due invoices

#### Invoice List View

Detailed table showing:

- **Invoice Number**: Unique identifier
- **Client**: Company or project name
- **Amount**: Invoice value
- **Status**: Payment status (pending, approved, paid, overdue)
- **Due Date**: Payment deadline
- **Reviewer**: Who reviewed the invoice
- **Approver**: Who approved the invoice
- **Actions**: View, edit, approve, generate PDF

#### Invoice Approval Workflow

**Step 1: Invoice Review**

- **Reviewer Role**: Board members with "reviewer" role can review invoices
- **Review Process**: Check invoice details and accuracy
- **Review Comments**: Add comments about the invoice
- **Review Status**: Mark as "reviewed" or request changes

**Step 2: Invoice Approval**

- **Approver Role**: Board members with "approver" role can approve invoices
- **Approval Process**: Final approval for payment
- **Approval Comments**: Add approval comments
- **Approval Status**: Mark as "approved" for payment

**Step 3: Payment Processing**

- **Payment Status**: Track payment progress
- **Payment Confirmation**: Confirm when payment is received
- **Payment History**: Complete payment audit trail

#### Invoice Actions

**Generate Invoice**
To create a new invoice, click the "Generate Invoice" button.

- **Client Selection**: Choose company or project
- **Invoice Details**: Description and line items
- **Amount Calculation**: Automatic calculation based on hours
- **Payment Terms**: Due date and payment method
- **PDF Generation**: Create professional invoice PDF

**Review Invoice**
To review an invoice, click the "Review" button.

- **Invoice Details**: Complete invoice information
- **Review Comments**: Add review comments
- **Review Status**: Mark as reviewed or request changes
- **Submit Review**: Submit review for approval

**Approve Invoice**
To approve an invoice, click the "Approve" button.

- **Approval Comments**: Add approval comments
- **Approval Status**: Mark as approved for payment
- **Submit Approval**: Submit approval for processing

**Bulk Actions**

- **Select Multiple**: Select multiple invoices for batch processing
- **Bulk Approve**: Approve multiple invoices at once
- **Bulk Mark as Paid**: Mark multiple invoices as paid
- **Bulk Export**: Export multiple invoices as PDF

**Invoice Management**

- **Edit Invoice**: Modify invoice details
- **Mark as Paid**: Update payment status
- **Send Reminders**: Notify clients of overdue payments
- **Export Data**: Generate invoice reports

## Reports

To access company reports, click on "Reports" in the sidebar.

### Available Reports

Comprehensive reporting system with multiple report types:

#### Employee Time Logs Report

- **Time Tracking**: Consultant hours and productivity
- **Project Hours**: Time spent on specific projects
- **Department Performance**: Department-level metrics
- **Export Options**: PDF, Excel, CSV formats

#### Project Progress & Status Report

- **Project Completion**: Status and progress tracking
- **Timeline Analysis**: Project milestones and deadlines
- **Resource Allocation**: Project team assignments
- **Performance Metrics**: Project efficiency and productivity

#### Invoice Summary Report

- **Billing Overview**: Invoice totals and status
- **Payment Tracking**: Payment history and trends
- **Client Analysis**: Client billing patterns
- **Revenue Reports**: Income and revenue analysis

#### Department Performance Report

- **Productivity Metrics**: Department efficiency
- **Resource Utilization**: Team capacity and usage
- **Performance Comparison**: Department benchmarking
- **Trend Analysis**: Performance over time

#### Consultant Performance Report

- **Individual Metrics**: Personal productivity
- **Hours Tracking**: Time logging patterns
- **Project Contribution**: Project involvement
- **Performance Reviews**: Evaluation data

---

# Board Member Role - Complete Guide

## Overview

Board Members have read-only access to company-wide information and analytics. They can view reports, monitor performance, and access financial data but cannot make changes to the system.

## Dashboard Features

### Main Dashboard

Same dashboard as Company Admin but with read-only access.

#### Summary Cards (Read-Only)

- **Departments**: Total number of departments
- **Projects**: Count of all company projects
- **Consultants**: Total consultants across company
- **Hours Logged**: Cumulative hours for entire company

#### Charts and Analytics (Read-Only)

- **Hours by Project Chart**: Time distribution across projects
- **Task Distribution Chart**: Task allocation visualization
- **Company Performance**: Overall company metrics
- **Department Comparison**: Performance across departments

## Project Management (Read-Only)

To view company projects, click on "Projects" in the sidebar.

### Project Overview

View all company projects without editing capabilities.

#### Project List View

- **Project Name**: Title of the project
- **Department**: Responsible department
- **Project Lead**: Assigned team member
- **Status**: Current project status
- **Progress**: Completion percentage
- **Deadline**: Project completion date
- **View Only**: No edit or delete options

#### Project Charts (Read-Only)

- **Project Status Chart**: Visual distribution of project statuses
- **Project Timeline Chart**: Projects organized by completion percentage
- **Department Projects**: Projects grouped by department

## Task Management (Read-Only)

To view company tasks, click on "Tasks" in the sidebar.

### Task Overview

View all company tasks without editing capabilities.

#### Task List View

- **Task Title**: Name of the task
- **Project**: Associated project
- **Department**: Responsible department
- **Owner**: Assigned consultant
- **Duration**: Time spent on task
- **Status**: Current task status
- **View Only**: No edit or delete options

#### Task Charts (Read-Only)

- **Task Status Chart**: Visual breakdown of task completion
- **Tasks by Department Chart**: Department task distribution
- **Performance Metrics**: Task completion rates and trends

## Consultant Management (Read-Only)

To view company consultants, click on "Consultants" in the sidebar.

### Consultant Overview

View all company consultants without editing capabilities.

#### Consultant List View

- **Profile Information**: Name, email, phone, department
- **Status**: Active, inactive, or on leave
- **Hours Summary**: Today, this week, this month
- **Performance**: Trend indicators and metrics
- **View Only**: No edit or status change options

#### Consultant Detail Modal (Read-Only)

- **Overview Tab**: Hours summary and performance metrics
- **Logs by Range Tab**: Time log history and statistics
- **Personal Tab**: Profile and employment information
- **Next of Kin Tab**: Emergency contact details
- **Bank Details Tab**: Payment information
- **Read-Only**: No editing capabilities

## Department Management (Read-Only)

To view company departments, click on "Departments" in the sidebar.

### Department Overview

View all company departments without editing capabilities.

#### Department List View

- **Department Name**: Name of the department
- **Department Head**: Assigned head of department
- **Employee Count**: Number of consultants in department
- **Status**: Active or inactive
- **View Only**: No edit or delete options

#### Department Charts (Read-Only)

- **Department Distribution Chart**: Visual employee distribution
- **Performance Metrics**: Department productivity and efficiency
- **Team Size Comparison**: Department size analysis

## Reports (Read-Only)

To access company reports, click on "Reports" in the sidebar.

### Available Reports

Access to all company reports with read-only permissions:

#### Employee Time Logs Report

- **Time Tracking**: Consultant hours and productivity
- **Project Hours**: Time spent on specific projects
- **Department Performance**: Department-level metrics
- **Export Options**: PDF, Excel, CSV formats

#### Project Progress & Status Report

- **Project Completion**: Status and progress tracking
- **Timeline Analysis**: Project milestones and deadlines
- **Resource Allocation**: Project team assignments
- **Performance Metrics**: Project efficiency and productivity

#### Invoice Summary Report

- **Billing Overview**: Invoice totals and status
- **Payment Tracking**: Payment history and trends
- **Client Analysis**: Client billing patterns
- **Revenue Reports**: Income and revenue analysis

#### Department Performance Report

- **Productivity Metrics**: Department efficiency
- **Resource Utilization**: Team capacity and usage
- **Performance Comparison**: Department benchmarking
- **Trend Analysis**: Performance over time

#### Consultant Performance Report

- **Individual Metrics**: Personal productivity
- **Hours Tracking**: Time logging patterns
- **Project Contribution**: Project involvement
- **Performance Reviews**: Evaluation data

---

# Super Admin Role - Complete Guide

## Overview

Super Admins have system-wide access to manage all companies, users, packages, licenses, and system-wide analytics. They oversee the entire TRS platform.

## Dashboard Features

### Main Dashboard

System-wide overview with comprehensive metrics.

#### Summary Cards

- **Total Companies**: Number of companies in system
- **Active Licenses**: Count of active licenses
- **Total Users**: Users across all companies
- **Total Revenue**: System-wide revenue

#### Charts and Analytics

- **Super Admin Chart**: System-wide performance metrics
- **Revenue Chart**: Revenue trends and analysis
- **Company Growth**: Company acquisition trends
- **User Growth**: User registration trends

## Company Management

To manage all companies, click on "Companies" in the sidebar.

### Company Overview

Complete management of all companies in the system.

#### Summary Statistics

- **Total Companies**: Count of all companies
- **Active Companies**: Currently active companies
- **Trial Companies**: Companies on trial
- **Total Users**: Users across all companies
- **Average Users**: Average users per company

#### Company List View

Detailed table showing:

- **Company Name**: Name of the company
- **Package**: Current subscription package
- **Users**: Number of users
- **Status**: Active, trial, or inactive
- **Created Date**: Registration date
- **Actions**: View details, edit, manage

#### Company Actions

**View Company Details**

- **Company Information**: Name, description, contact
- **Package Details**: Current subscription and features
- **User Management**: List of all company users
- **Billing Information**: Payment and invoice history
- **Usage Statistics**: System usage metrics

**Edit Company**

- Modify company details and settings
- Update package and subscription
- Manage user access and permissions
- Update billing information
- Change company status

**Company Charts**

- **Companies by Package Chart**: Package distribution
- **Company Growth**: Registration trends
- **User Distribution**: User count per company

## Package Management

To manage subscription packages, click on "Packages" in the sidebar.

### Package Overview

Complete management of subscription packages.

#### Package List View

Detailed table showing:

- **Package Name**: Name of the package
- **Description**: Package features and benefits
- **Price**: Subscription cost
- **Duration**: Billing cycle
- **Users**: Maximum user limit
- **Status**: Active or inactive
- **Actions**: Edit, delete, manage

#### Package Actions

**Create New Package**
To create a new package, click the "Add Package" button.

- **Package Information**: Name and description
- **Pricing**: Cost and billing cycle
- **Features**: Included features and limits
- **User Limits**: Maximum users allowed
- **Status**: Active or inactive

**Edit Package**

- Modify package details and pricing
- Update features and limits
- Change user restrictions
- Update package status

**Delete Package**

- Remove package from system
- Confirmation dialog for safety
- Permanent deletion with warning
- Cannot be undone

#### Package Charts

- **Package Distribution Chart**: Package usage across companies
- **Revenue by Package**: Income breakdown by package
- **Package Conversion**: Trial to paid conversion rates

## License Management

To manage company licenses, click on "Licenses" in the sidebar.

### License Overview

Complete management of company licenses.

#### License List View

Detailed table showing:

- **License ID**: Unique license identifier
- **Company**: Associated company
- **Package**: License package type
- **Status**: Active, expired, or suspended
- **Expiry Date**: License expiration date
- **Actions**: Edit, renew, suspend

#### License Actions

**Create New License**
To create a new license, click the "Add License" button.

- **Company Selection**: Choose company
- **Package Assignment**: Select package type
- **Duration**: License validity period
- **Features**: Included features and limits
- **Status**: Active or inactive

**Edit License**

- Modify license details and features
- Update package and duration
- Change license status
- Manage feature access

**License Management**

- **Renew License**: Extend license validity
- **Suspend License**: Temporarily disable access
- **Activate License**: Enable license access
- **Cancel License**: Terminate license

## Analytics

To view system analytics, click on "Analytics" in the sidebar.

### System Analytics

Comprehensive system-wide analytics and reporting.

#### Available Analytics

**Company Growth Chart**

- **Registration Trends**: New company registrations
- **Growth Rate**: Month-over-month growth
- **Geographic Distribution**: Company locations
- **Industry Analysis**: Company types and sectors

**User Growth Chart**

- **User Registration**: New user signups
- **Active Users**: Daily and monthly active users
- **User Retention**: User engagement and retention
- **Growth Projections**: Future growth estimates

**Regional Distribution Chart**

- **Geographic Analysis**: User distribution by region
- **Country Statistics**: User count by country
- **Time Zone Analysis**: User activity by time zone
- **Regional Performance**: Regional usage metrics

**Package Conversion Chart**

- **Trial to Paid**: Conversion rates
- **Package Upgrades**: Upgrade patterns
- **Churn Analysis**: Customer retention
- **Revenue Impact**: Conversion impact on revenue

**Platform Usage Chart**

- **Feature Usage**: Most used features
- **User Engagement**: Platform engagement metrics
- **Performance Metrics**: System performance data
- **Usage Patterns**: User behavior analysis

**Feature Adoption Chart**

- **Feature Rollout**: New feature adoption
- **Usage Trends**: Feature usage over time
- **User Feedback**: Feature satisfaction
- **Adoption Rates**: Feature adoption percentages

**Retention Rate Chart**

- **User Retention**: User retention rates
- **Company Retention**: Company retention rates
- **Churn Analysis**: Customer churn patterns
- **Retention Strategies**: Retention improvement

#### Analytics Features

- **Date Range Selection**: Custom time periods
- **Export Options**: PDF, Excel, CSV formats
- **Real-time Data**: Live analytics updates
- **Custom Reports**: Personalized analytics

## Invoice Management

To manage system invoices, click on "Invoices" in the sidebar.

### System Invoice Management

Complete invoice management across all companies.

#### Invoice Overview

- **Total Invoices**: Count of all system invoices
- **Pending Invoices**: Unpaid invoices
- **Paid Invoices**: Completed payments
- **Overdue Invoices**: Past due invoices

#### Invoice List View

Detailed table showing:

- **Invoice Number**: Unique identifier
- **Company**: Associated company
- **Amount**: Invoice value
- **Status**: Payment status
- **Due Date**: Payment deadline
- **Actions**: View, edit, manage

#### Invoice Actions

**Generate Invoice**
To create a new invoice, click the "Generate Invoice" button.

- **Company Selection**: Choose company
- **Invoice Details**: Description and line items
- **Amount Calculation**: Automatic calculation
- **Payment Terms**: Due date and payment method
- **PDF Generation**: Create professional invoice PDF

**Invoice Management**

- **Edit Invoice**: Modify invoice details
- **Mark as Paid**: Update payment status
- **Send Reminders**: Notify companies of overdue payments
- **Export Data**: Generate invoice reports

## Quote Management

To manage quotes, click on "Quotes" in the sidebar.

### Quote System

Complete quote management for potential customers.

#### Quote Overview

- **Total Quotes**: Count of all quotes
- **Pending Quotes**: Unprocessed quotes
- **Accepted Quotes**: Converted quotes
- **Expired Quotes**: Past due quotes

#### Quote List View

Detailed table showing:

- **Quote Number**: Unique identifier
- **Company**: Potential customer
- **Amount**: Quote value
- **Status**: Quote status
- **Expiry Date**: Quote expiration
- **Actions**: View, edit, manage

#### Quote Actions

**Create New Quote**
To create a new quote, click the "Add Quote" button.

- **Company Information**: Customer details
- **Quote Details**: Description and line items
- **Pricing**: Quote amount and terms
- **Validity Period**: Quote expiration date
- **PDF Generation**: Create professional quote PDF

**Quote Management**

- **Edit Quote**: Modify quote details
- **Send Quote**: Deliver quote to customer
- **Track Status**: Monitor quote progress
- **Convert to Invoice**: Convert accepted quotes

---

# Common Features Across All Roles

## Navigation and Interface

### Sidebar Navigation

Consistent navigation across all roles with role-specific menu items:

- **Dashboard**: Main overview page
- **Time Logs**: Personal time tracking (Consultants)
- **Projects**: Project management (Company Admins, Department Heads)
- **Tasks**: Task management (Company Admins, Department Heads)
- **Consultants**: User management (Company Admins, Department Heads)
- **Departments**: Department management (Company Admins)
- **Reports**: Analytics and reporting
- **Settings**: Personal and system preferences

### Header Features

- **User Profile**: Access to profile and settings
- **Notifications**: System notifications and alerts
- **Role Selector**: Switch between multiple roles (if applicable)
- **Logout**: Secure logout functionality

## Settings and Preferences

### Personal Settings

Available to all users:

- **Profile Management**: Update personal information
- **Password Management**: Change password securely
- **Notification Preferences**: Email and system notifications
- **Interface Preferences**: Dashboard and form preferences
- **Time Zone Settings**: Local time zone configuration

### Company Settings

Available to Company Admins and Super Admins:

- **Company Information**: Company name and details
- **Currency Settings**: Default currency for billing
- **Floating Point**: Enable decimal amounts on invoices
- **Company Logo**: Upload company branding
- **System Preferences**: Default system settings

## File Management

### File Upload System

Consistent across all roles:

- **Supported Formats**: Images, documents, spreadsheets, presentations
- **File Size Limits**: 10MB maximum per file
- **Upload Methods**: Drag and drop or click to browse
- **Progress Tracking**: Real-time upload progress
- **File Preview**: Automatic image previews
- **File Management**: View, download, and remove files

### File Types Supported

- **Images**: PNG, JPG, GIF, SVG
- **Documents**: PDF, Word documents
- **Spreadsheets**: Excel files
- **Presentations**: PowerPoint files
- **Text Files**: TXT, MD, CSV
- **Archives**: ZIP, RAR, TAR

## Reporting and Export

### Export Options

Available across all roles:

- **PDF Generation**: Professional formatted reports
- **Excel Export**: Spreadsheet format for analysis
- **CSV Export**: Data format for external systems
- **Date Range Selection**: Custom time periods
- **Filtered Export**: Export only filtered results

### Report Features

- **Summary Statistics**: Key metrics and totals
- **Visual Charts**: Graphs and charts for data visualization
- **Custom Formatting**: Professional report layouts
- **Batch Export**: Export multiple reports simultaneously

## Security and Access Control

### Authentication

- **Secure Login**: Email and password authentication
- **Password Recovery**: Secure password reset process
- **Session Management**: Automatic session timeout
- **Role-Based Access**: Permissions based on user role

### Data Security

- **File Encryption**: Secure file storage and transmission
- **Access Logging**: Track user actions and access
- **Data Backup**: Regular system backups
- **Privacy Protection**: Secure handling of personal data

---

# Troubleshooting

## Common Issues and Solutions

### Login Problems

**Issue**: Cannot log in with correct credentials
**Solutions**:

- Check email address spelling
- Ensure Caps Lock is off
- Try password reset if forgotten
- Clear browser cache and cookies
- Contact administrator if account is locked

### Time Logging Issues

**Issue**: Cannot create or save time logs
**Solutions**:

- Check internet connection
- Ensure all required fields are filled
- Verify file upload size limits (10MB max)
- Try refreshing the page
- Clear browser cache

### File Upload Problems

**Issue**: Files not uploading or attaching
**Solutions**:

- Check file size (must be under 10MB)
- Verify file type is supported
- Ensure stable internet connection
- Try uploading one file at a time
- Check browser compatibility

### Performance Issues

**Issue**: Slow loading or unresponsive interface
**Solutions**:

- Refresh the browser page
- Clear browser cache and cookies
- Check internet connection speed
- Close unnecessary browser tabs
- Try a different browser

### Data Not Updating

**Issue**: Changes not reflecting in the system
**Solutions**:

- Refresh the page
- Check internet connection
- Wait a few moments for server sync
- Log out and log back in
- Clear browser cache

## Browser Compatibility

### Supported Browsers

- **Chrome**: Version 90 or higher (recommended)
- **Firefox**: Version 88 or higher
- **Safari**: Version 14 or higher
- **Edge**: Version 90 or higher

### Browser Requirements

- **JavaScript**: Must be enabled
- **Cookies**: Must be enabled
- **Local Storage**: Required for preferences
- **File API**: Required for file uploads
- **Canvas API**: Required for image previews

## Getting Help

### Support Channels

- **Email Support**: Contact your system administrator
- **Documentation**: Refer to this user guide
- **Training**: Request training sessions from administrators
- **Feedback**: Provide feedback through the system

### Best Practices

- **Regular Backups**: Ensure data is regularly backed up
- **Secure Passwords**: Use strong, unique passwords
- **Regular Updates**: Keep browsers updated
- **Data Validation**: Verify information before submitting
- **File Management**: Organize attachments logically

---

## Conclusion

The Task Reporting System (TRS) provides a comprehensive solution for time tracking, project management, and organizational oversight. Each user role has been carefully designed with specific permissions and capabilities to ensure efficient workflow and proper access control.

By following this detailed role-based guide, users can effectively utilize all features of the system to improve productivity, track progress, and generate valuable insights for their organization.

Remember to:

- Use your role-appropriate features and permissions
- Log time regularly and accurately
- Use descriptive task titles and detailed descriptions
- Attach relevant files and links to time logs
- Review reports regularly for insights
- Keep your profile information up to date
- Contact your administrator for any system issues

For additional support or questions not covered in this guide, please contact your system administrator or refer to the system's built-in help features.
