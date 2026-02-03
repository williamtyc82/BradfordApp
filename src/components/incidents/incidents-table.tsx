"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Badge } from "../ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Incident, User } from "@/lib/types"

import { useRouter } from "next/navigation"
import { useFirebase, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, where, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2 } from "lucide-react"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'Resolved': 'default',
  'In Progress': 'secondary',
  'Pending': 'destructive'
}

// We need a way to get user names. For now, we'll fetch them from a 'users' collection if it exists,
// or just show the ID. Since we have a 'users' collection from previous tasks, let's use it.
const ReporterName = ({ userId }: { userId: string }) => {
  const { firestore } = useFirebase();
  const userRef = useMemoFirebase(() => firestore ? doc(firestore, "users", userId) : null, [firestore, userId]);
  const { data: userData, isLoading } = useDoc<User>(userRef);

  if (isLoading) return <span className="text-muted-foreground animate-pulse">...</span>;
  return <span>{userData?.displayName || userId}</span>;
}

const ActionsCell: React.FC<{ row: Row<Incident> }> = ({ row }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const updateStatus = async (newStatus: Incident['status']) => {
    if (!firestore) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(firestore, "incidents", row.original.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Status Updated", description: `Incident status changed to ${newStatus}.` });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not update status.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteIncident = async () => {
    if (!firestore || !window.confirm("Are you sure you want to archive this incident?")) return;
    try {
      await deleteDoc(doc(firestore, "incidents", row.original.id));
      toast({ title: "Incident Archived", description: "The incident report has been removed." });
    } catch (error) {
      toast({ title: "Archive Failed", description: "Could not archive incident.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/incidents/${row.original.id}`)}>
            View Details
          </DropdownMenuItem>
          {user?.role === 'manager' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => updateStatus('Pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('In Progress')}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('Resolved')}>Resolved</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={deleteIncident} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Archive Incident
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Incident>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "reportedBy",
    header: "Reporter",
    cell: ({ row }) => <ReporterName userId={row.getValue("reportedBy")} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariantMap[row.getValue("status") as string] || 'outline'}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${row.getValue("severity") === 'High' ? 'bg-red-500' :
          row.getValue("severity") === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}></span>
        {row.getValue("severity")}
      </div>
    ),
  },
  {
    accessorKey: "reportedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Reported
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{new Date(row.getValue("reportedAt")).toLocaleDateString()}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]

export function IncidentsTable() {
  const router = useRouter();
  const { user } = useAuth();
  const { firestore } = useFirebase();

  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const baseQuery = collection(firestore, "incidents");
    if (user.role === 'manager') {
      return query(baseQuery, orderBy("reportedAt", "desc"));
    } else {
      return query(baseQuery, where("reportedBy", "==", user.id), orderBy("reportedAt", "desc"));
    }
  }, [firestore, user]);

  const { data: incidentsData, isLoading, error } = useCollection<Incident>(incidentsQuery);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data: incidentsData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading incident reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive space-y-2">
        <p className="font-semibold">Error loading incidents</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter incidents by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                  onClick={() => router.push(`/dashboard/incidents/${row.original.id}`)}
                  className="cursor-pointer"
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
                  No incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} incident(s).
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
