
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
import { placeholderUsers, userProgressData, quizzes } from "@/lib/placeholder-data"
import { User, UserProgress } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Progress } from "../ui/progress"

type TeamMemberProgress = User & {
    progress?: UserProgress
}

const calculateAverageQuizScorePercent = (progress: UserProgress | undefined) => {
    if (!progress || progress.quizzesTaken.length === 0) {
        return 0;
    }

    const totalScore = progress.quizzesTaken.reduce((acc, takenQuiz) => {
        return acc + takenQuiz.score;
    }, 0);

    const totalPossibleScore = progress.quizzesTaken.reduce((acc, takenQuiz) => {
        const quiz = quizzes.find(q => q.id === takenQuiz.quizId);
        if (!quiz) return acc;
        const quizTotalPoints = quiz.questions.reduce((total, q) => total + q.points, 0);
        return acc + quizTotalPoints;
    }, 0);
    
    if (totalPossibleScore === 0) return 0;

    return Math.round((totalScore / totalPossibleScore) * 100);
}


export const columns: ColumnDef<TeamMemberProgress>[] = [
  {
    accessorKey: "displayName",
    header: "Worker",
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={row.original.photoURL} alt={row.original.displayName} />
                <AvatarFallback>{row.original.displayName.charAt(0)}</AvatarFallback>
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
        const completion = row.original.progress?.trainingCompletion || 0;
        return (
            <div className="flex items-center gap-2">
                <Progress value={completion} className="w-24 h-2" />
                <span className="text-muted-foreground">{completion}%</span>
            </div>
        )
    },
  },
  {
    id: "avgQuizScore",
    header: "Avg. Quiz Score",
    cell: ({ row }) => {
        const avgScore = calculateAverageQuizScorePercent(row.original.progress);
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
        const lastActivity = row.original.progress?.lastActivity;
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
  const workers = placeholderUsers.filter(u => u.role === 'worker');
  const data: TeamMemberProgress[] = workers.map(worker => ({
      ...worker,
      progress: userProgressData.find(p => p.userId === worker.id)
  }));

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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
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
    </div>
  )
}
