'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Lock, LockOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const dummyProject = {
    id: 1,
    name: 'Project Alpha',
    description: 'This is a sample project description.',
    status: 'In Progress',
};

const statuses = ['Not Started', 'In Progress', 'Completed'];

type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';
const statusToCompletion: Record<ProjectStatus, number> = {
    'Not Started': 0,
    'In Progress': 50,
    'Completed': 100,
};

const completionToStatus = (value: number): ProjectStatus => {
    if (value === 0) return 'Not Started';
    if (value === 100) return 'Completed';
    return 'In Progress';
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Not Started':
            return 'text-gray-500';
        case 'In Progress':
            return 'text-blue-500';
        case 'Completed':
            return 'text-green-500';
        case 'On Hold':
            return 'text-amber-500';
        default:
            return 'text-gray-500';
    }
};

const ProjectDetailPage = () => {
    const [status, setStatus] = useState<ProjectStatus>(dummyProject.status as ProjectStatus);
    const [completion, setCompletion] = useState<number>(statusToCompletion[dummyProject.status as ProjectStatus] ?? 0);
    const [onHold, setOnHold] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="p-6 max-w-xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-4" />
                    <div className="h-10 bg-gray-200 rounded mb-2" />
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
        );
    }

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
        setOnHold(!onHold);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: 'Project Updated',
            description: onHold
                ? `Status: On Hold (Last Known: ${status}, ${completion}%)`
                : `Status: ${status}, Completion: ${completion}%`,
        });
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh] p-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>{dummyProject.name}</CardTitle>
                    <CardDescription>{dummyProject.description}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                                disabled={onHold}
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
                            <Label htmlFor="completion">Completion</Label>
                            <div className="flex items-center gap-4">
                                <Slider
                                    id="completion"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[completion]}
                                    onValueChange={handleCompletionChange}
                                    className="w-full"
                                    disabled={onHold}
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
                                <div className="text-sm text-amber-500 mt-1">
                                    Project is currently <strong>On Hold</strong>.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Update Project
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ProjectDetailPage;
