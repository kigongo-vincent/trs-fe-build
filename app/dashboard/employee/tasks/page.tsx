import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Filter, Plus, Search, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/employee/time-logs/new">
              <Plus className="mr-2 h-4 w-4" /> Log Time
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="Search tasks..." className="h-9" />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Search</span>
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="website">Website Redesign</SelectItem>
              <SelectItem value="bug">Bug Fixes</SelectItem>
              <SelectItem value="product">Product Launch</SelectItem>
              <SelectItem value="marketing">Marketing Campaign</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>View and manage all your assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's Tasks */}
                <div className="rounded-lg border p-3">
                  <h3 className="mb-2 font-medium">Today - May 11, 2025</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Update website homepage</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Website Redesign</Badge>
                            <span className="text-xs text-muted-foreground">Due today at 5:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">2h / 4h</span>
                        <Button variant="outline" size="sm">
                          Log Time
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Fix login page bug</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Bug Fixes</Badge>
                            <span className="text-xs text-muted-foreground">Due today at 3:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">1.5h / 3h</span>
                        <Button variant="outline" size="sm">
                          Log Time
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Create new product mockups</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Product Launch</Badge>
                            <span className="text-xs text-muted-foreground">Due today at 6:00 PM</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">3h / 5h</span>
                        <Button variant="outline" size="sm">
                          Log Time
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="rounded-lg border p-3">
                  <h3 className="mb-2 font-medium">Upcoming</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="font-medium">Prepare monthly report</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Analytics</Badge>
                            <span className="text-xs text-muted-foreground">Due tomorrow</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="secondary">Tomorrow</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="font-medium">Client meeting</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Client Onboarding</Badge>
                            <span className="text-xs text-muted-foreground">May 13, 2025</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="secondary">In 2 days</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overdue Tasks */}
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3">
                  <h3 className="mb-2 font-medium text-red-600 dark:text-red-400">Overdue</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-red-200 dark:border-red-900 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                        </div>
                        <div>
                          <p className="font-medium">Update API documentation</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="border-red-200 dark:border-red-800">
                              Backend Project
                            </Badge>
                            <span className="text-xs text-red-600 dark:text-red-400">Due May 10, 2025</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="destructive">1 day overdue</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Tasks due today - May 11, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Update website homepage</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Website Redesign</Badge>
                        <span className="text-xs text-muted-foreground">Due today at 5:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">2h / 4h</span>
                    <Button variant="outline" size="sm">
                      Log Time
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Fix login page bug</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Bug Fixes</Badge>
                        <span className="text-xs text-muted-foreground">Due today at 3:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">1.5h / 3h</span>
                    <Button variant="outline" size="sm">
                      Log Time
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Create new product mockups</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Product Launch</Badge>
                        <span className="text-xs text-muted-foreground">Due today at 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">3h / 5h</span>
                    <Button variant="outline" size="sm">
                      Log Time
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks scheduled for the future</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium">Prepare monthly report</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Analytics</Badge>
                        <span className="text-xs text-muted-foreground">Due tomorrow</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary">Tomorrow</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium">Client meeting</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Client Onboarding</Badge>
                        <span className="text-xs text-muted-foreground">May 13, 2025</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary">In 2 days</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium">Update documentation</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Knowledge Base</Badge>
                        <span className="text-xs text-muted-foreground">May 18, 2025</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary">Next week</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
              <CardDescription>Tasks that have passed their due date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-red-200 dark:border-red-900 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <p className="font-medium">Update API documentation</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-red-200 dark:border-red-800">
                          Backend Project
                        </Badge>
                        <span className="text-xs text-red-600 dark:text-red-400">Due May 10, 2025</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="destructive">1 day overdue</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-red-200 dark:border-red-900 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <p className="font-medium">Submit expense report</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-red-200 dark:border-red-800">
                          Finance
                        </Badge>
                        <span className="text-xs text-red-600 dark:text-red-400">Due May 8, 2025</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="destructive">3 days overdue</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
