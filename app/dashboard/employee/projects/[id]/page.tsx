'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const dummyProject = {
    id: 1,
    name: 'Project Alpha',
    description: 'This is a sample project description.',
    status: 'In Progress',
};

const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

const ProjectDetailPage = () => {
    // In a real app, fetch project by ID from params
    const [status, setStatus] = useState(dummyProject.status);
    const router = useRouter();
    const { toast } = useToast();

    const handleStatusChange = (value: string) => {
        setStatus(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would call an API to update the project status
        toast({
            title: 'Status Updated',
            description: `Project status updated to: ${status}`,
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
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Update Status</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ProjectDetailPage; 