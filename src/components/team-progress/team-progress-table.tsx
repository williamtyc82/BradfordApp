
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User, QuizResult, TrainingMaterial } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Progress } from "../ui/progress"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase"
import { collection, query, addDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type TeamMemberProgress = User & {
  progress: {
    trainingCompletion: number;
    avgQuizScore: number;
    lastActivity: string | null;
  }
}

export const columns: ColumnDef<TeamMemberProgress>[] = [
  {
    accessorKey: "displayName",
    header: "Worker",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={row.original.photoURL} alt={row.original.displayName} />
          <AvatarFallback>{row.original.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.getValue("displayName")}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "progress.trainingCompletion",
    header: "Training Completion",
    cell: ({ row }) => {
      const completion = row.original.progress.trainingCompletion;
      return (
        <div className="flex items-center gap-2">
          <Progress value={completion} className="w-24 h-2" />
          <span className="text-muted-foreground">{completion}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "progress.avgQuizScore",
    header: "Avg. Quiz Score",
    cell: ({ row }) => {
      const avgScore = row.original.progress.avgQuizScore;
      return (
        <div className="flex items-center gap-2">
          <Progress value={avgScore} className="w-24 h-2" />
          <span className="text-muted-foreground">{avgScore}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "progress.lastActivity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lastActivity = row.original.progress.lastActivity;
      return <div>{lastActivity ? new Date(lastActivity).toLocaleDateString() : 'N/A'}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View Full Profile</DropdownMenuItem>
          <DropdownMenuItem>Assign Training</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function TeamProgressTable() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  // Fetch Data - Only if manager
  const usersRef = useMemoFirebase(() =>
    (firestore && isManager) ? query(collection(firestore, "users")) : null,
    [firestore, isManager]
  );
  const { data: users } = useCollection<User>(usersRef);

  const quizResultsRef = useMemoFirebase(() =>
    (firestore && isManager) ? query(collection(firestore, "quizResults")) : null,
    [firestore, isManager]
  );
  const { data: quizResults } = useCollection<QuizResult>(quizResultsRef);

  // We define a local type for training logs since it's simple
  const trainingLogsRef = useMemoFirebase(() =>
    (firestore && isManager) ? query(collection(firestore, "trainingLogs")) : null,
    [firestore, isManager]
  );
  const { data: trainingLogs } = useCollection<{ userId: string, materialId: string, viewedAt: string }>(trainingLogsRef);

  const materialsRef = useMemoFirebase(() =>
    (firestore && isManager) ? query(collection(firestore, "trainingMaterials")) : null,
    [firestore, isManager]
  );
  const { data: materials } = useCollection<TrainingMaterial>(materialsRef);

  const data = React.useMemo(() => {
    if (!users) return [];
    const workers = users.filter(u => u.role === 'worker');
    const totalMaterials = materials?.length || 0;

    return workers.map(worker => {
      // Training Completion
      const workerLogs = trainingLogs?.filter(l => l.userId === worker.id) || [];
      // Count unique materials viewed
      const uniqueMaterialsViewed = new Set(workerLogs.map(l => l.materialId)).size;
      // Cap at 100% just in case of logic drift (e.g. material deleted but log remains)
      // But actually if material deleted, totalMaterials decreases, so % could go > 100 if we count logs for deleted materials.
      // Improve: Filter logs to only include current materials
      const validLogs = workerLogs.filter(l => materials?.some(m => m.id === l.materialId));
      const uniqueValidMaterials = new Set(validLogs.map(l => l.materialId)).size;

      const trainingCompletion = totalMaterials > 0 ? Math.round((uniqueValidMaterials / totalMaterials) * 100) : 0;

      // Quiz Scores
      const workerQuizzes = quizResults?.filter(r => r.userId === worker.id) || [];
      const totalScore = workerQuizzes.reduce((acc, curr) => acc + curr.score, 0);
      const avgQuizScore = workerQuizzes.length > 0 ? Math.round(totalScore / workerQuizzes.length) : 0;

      return {
        ...worker,
        progress: {
          trainingCompletion,
          avgQuizScore,
          lastActivity: worker.lastLogin || null
        }
      };
    });
  }, [users, quizResults, trainingLogs, materials]);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const [selectedProfileUser, setSelectedProfileUser] = React.useState<TeamMemberProgress | null>(null);
  const [assignTrainingUser, setAssignTrainingUser] = React.useState<TeamMemberProgress | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = React.useState<string>("");

  const { toast } = useToast(); // Would need to import usage of useToast if not present, but let's assume or add it.

  const handleAssignTraining = async () => {
    if (!assignTrainingUser || !selectedMaterialId || !firestore) return;

    try {
      // Create a training assignment
      // We'll store this in a new collection 'trainingAssignments'
      // Or we can just log a 'view' with a special flag if we want to be lazy, but let's do it properly-ish.
      // Actually, for this prototype, let's just create a toast. The user just wants the button to work.
      // But let's actually write to a collection to allow future expansion.
      await addDoc(collection(firestore, "trainingAssignments"), {
        userId: assignTrainingUser.id,
        materialId: selectedMaterialId,
        assignedBy: user?.id,
        assignedAt: new Date().toISOString(),
        status: 'pending'
      });

      toast({
        title: "Training Assigned",
        description: `Assigned material to ${assignTrainingUser.displayName}`,
      });
      setAssignTrainingUser(null);
      setSelectedMaterialId("");
    } catch (error) {
      console.error("Error assigning training:", error);
      toast({
        title: "Assignment Failed",
        description: "Could not assign training. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by worker name..."
          value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("displayName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Intercept the actions cell to inject our handlers
                    if (cell.column.id === 'actions') {
                      return (
                        <TableCell key={cell.id}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setSelectedProfileUser(row.original), 100)}>
                                View Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setAssignTrainingUser(row.original), 100)}>
                                Assign Training
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )
                    }
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} worker(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Profile Dialog */}
      <Dialog open={!!selectedProfileUser} onOpenChange={(open) => !open && setSelectedProfileUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Worker Profile</DialogTitle>
          </DialogHeader>
          {selectedProfileUser && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProfileUser.photoURL} alt={selectedProfileUser.displayName} />
                  <AvatarFallback>{selectedProfileUser.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedProfileUser.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProfileUser.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Email</Label>
                <span className="col-span-3">{selectedProfileUser.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Joined</Label>
                <span className="col-span-3">{new Date(selectedProfileUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Last Active</Label>
                <span className="col-span-3">{selectedProfileUser.lastLogin ? new Date(selectedProfileUser.lastLogin).toLocaleString() : 'Never'}</span>
              </div>
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Completion</span>
                    <span className="font-medium">{selectedProfileUser.progress.trainingCompletion}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Quiz Score</span>
                    <span className="font-medium">{selectedProfileUser.progress.avgQuizScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Training Dialog */}
      <Dialog open={!!assignTrainingUser} onOpenChange={(open) => !open && setAssignTrainingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              Assign a training module to {assignTrainingUser?.displayName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="material">Select Material</Label>
              <Select onValueChange={setSelectedMaterialId} value={selectedMaterialId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {materials?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTrainingUser(null)}>Cancel</Button>
            <Button onClick={handleAssignTraining} disabled={!selectedMaterialId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
