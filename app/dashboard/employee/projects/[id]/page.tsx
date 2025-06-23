'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const dummyProject = {
    id: 1,
    name: 'Project Alpha',
    description: 'This is a sample project description.',
    status: 'In Progress',
};

const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
const statusToCompletion: Record<ProjectStatus, number> = {
    'Not Started': 0,
    'In Progress': 50,
    'Completed': 100,
    'On Hold': 0,
};
const completionToStatus = (value: number): ProjectStatus => {
    if (value === 0) return 'Not Started';
    if (value === 100) return 'Completed';
    if (value > 0 && value < 100) return 'In Progress';
    return 'Not Started';
};

const ProjectDetailPage = () => {
    // In a real app, fetch project by ID from params
    const [status, setStatus] = useState<ProjectStatus>(dummyProject.status as ProjectStatus);
    const [completion, setCompletion] = useState<number>(statusToCompletion[dummyProject.status as ProjectStatus] ?? 0);
    const router = useRouter();
    const { toast } = useToast();

    const handleStatusChange = (value: ProjectStatus) => {
        setStatus(value);
        setCompletion(statusToCompletion[value]);
    };

    const handleCompletionChange = (value: number[]) => {
        const percent = value[0];
        setCompletion(percent);
        setStatus(completionToStatus(percent));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would call an API to update the project status and completion
        toast({
            title: 'Project Updated',
            description: `Status: ${status}, Completion: ${completion}%`,
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
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
                                />
                                <span className="w-12 text-right font-mono">{completion}%</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Update Project</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ProjectDetailPage; 