'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Project, getProjectsByLead, updateProject } from '@/services/projects';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Lock, LockOpen, Pencil, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getStatusColor = (status: string): string => {
    return "text-gray-700"
    if (!status || typeof status !== 'string') return 'text-gray-500';
    switch (status.toLowerCase()) {
        case 'not started':
            return 'text-gray-500';
        case 'in progress':
            return 'text-blue-500';
        case 'completed':
            return 'text-green-500';
        case 'on hold':
            return 'text-amber-500';
        default:
            return 'text-gray-500';
    }
};

type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
const statuses: ProjectStatus[] = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
const statusToCompletion: Record<ProjectStatus, number> = {
    'Not Started': 0,
    'In Progress': 50,
    'Completed': 100,
    'On Hold': 0, // Assuming 0% progress for "On Hold"
};
const completionToStatus = (value: number): ProjectStatus => {
    if (value === 0) return 'Not Started';
    if (value === 100) return 'Completed';
    return 'In Progress';
};

const dbStatusToUI: Record<string, ProjectStatus> = {
    'active': 'In Progress',
    'inactive': 'Not Started',
    'completed': 'Completed',
    'on-hold': 'On Hold',
};
const normalizeStatus = (status: string | undefined | null): ProjectStatus => {
    if (!status) return 'Not Started';
    return dbStatusToUI[status] || 'Not Started';
};

const uiStatusToDB: Record<ProjectStatus, string> = {
    'In Progress': 'active',
    'Not Started': 'inactive',
    'Completed': 'completed',
    'On Hold': 'on-hold',
};

const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [status, setStatus] = useState<ProjectStatus>('Not Started');
    const [completion, setCompletion] = useState<number>(0);
    const [onHold, setOnHold] = useState<boolean>(false);
    const [modalLoading, setModalLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjectsByLead();
                setProjects(response.data);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // When a project is selected for editing, initialize modal state
    useEffect(() => {
        if (selectedProject) {
            const normalized = normalizeStatus(selectedProject.status);
            setStatus(normalized);
            setCompletion(selectedProject.progress ?? 0);
            setOnHold(normalized === 'On Hold');
        }
    }, [selectedProject]);

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setModalOpen(true);
    };

    const handleStatusChange = (value: ProjectStatus) => {
        setStatus(value);
        setCompletion(statusToCompletion[value]);
    };

    const handleCompletionChange = (value: number[]) => {
        const percent = value[0];
        setCompletion(percent);
        setStatus(completionToStatus(percent));
    };

    const handleLockToggle = () => {
        if (onHold) {
            setOnHold(false);
            setStatus('Not Started'); // or restore previous status if you store it
        } else {
            setOnHold(true);
            setStatus('On Hold');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;
        setModalLoading(true);
        try {
            // If onHold is true, status should be "On Hold"
            const statusToSend = onHold ? 'On Hold' : status;
            const dbStatus = uiStatusToDB[statusToSend];
            const response = await updateProject(selectedProject.id, {
                status: dbStatus,
                progress: completion,
            });
            const updatedProject = (response as any).data;

            setProjects((prev) =>
                prev.map((p) =>
                    p.id === selectedProject.id ? { ...p, ...updatedProject } : p
                )
            );
            setSelectedProject((prev) =>
                prev ? { ...prev, ...updatedProject } : prev
            );
            toast({
                title: 'Project Updated',
                description: onHold
                    ? `Status: On Hold (Last Known: ${status}, ${completion}%)`
                    : `Status: ${status}, Progress: ${completion}%`,
            });
            setModalOpen(false);
        } catch (err: any) {
            toast({
                title: 'Update failed',
                description: err?.message || 'Could not update project',
                variant: 'destructive',
            });
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="">
            <h1 className="text-xl font-medium mb-3 text-gradient">My Projects</h1>
            <div className="grid gap-4">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className=" transition-shadow cursor-pointer group"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{project.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Department: {project.department.name}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "px-2.5 py-1.5 h-auto font-semibold",
                                        getStatusColor(project.status)
                                    )}
                                >
                                    {project.status}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span className="font-mono">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Lead: {project.lead.fullName}</span>
                                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(project);
                                    }}
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Update
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {projects.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No projects found.
                    </div>
                )}
            </div>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className='md:max-w-[35vw] max-w-[95vw]'>
                    {selectedProject && (
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{selectedProject.name}</DialogTitle>
                                <DialogDescription>{selectedProject.department.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={status}
                                        onValueChange={handleStatusChange}
                                        disabled={onHold || modalLoading}
                                    >
                                        <SelectTrigger id="status" className={getStatusColor(status)}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem
                                                    key={s}
                                                    value={s}
                                                    className={getStatusColor(s)}
                                                >
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="progress">Progress</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            id="progress"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={[completion]}
                                            onValueChange={handleCompletionChange}
                                            className="w-full"
                                            disabled={onHold || modalLoading}
                                        />
                                        <span className={cn(
                                            "w-12 text-right font-mono",
                                            getStatusColor(status)
                                        )}>
                                            {completion}%
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleLockToggle}
                                            className={cn(
                                                "transition-colors shrink-0",
                                                onHold ? "text-amber-500 hover:text-amber-600" : "text-gray-400 hover:text-gray-500"
                                            )}
                                        >
                                            {onHold ? <Lock className="h-5 w-5" /> : <LockOpen className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                    {onHold && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            Project is currently <strong>On Hold</strong>.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="submit" className="" disabled={modalLoading}>
                                    {modalLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Update Project
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectsPage; 