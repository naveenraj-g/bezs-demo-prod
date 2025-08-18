import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Prompts } from "../../../../../../prisma/generated/ai-hub";
import { TanstackTableColumnSorting } from "@/shared/ui/table/tanstack-table-column-sorting";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ellipsis, Eye, PencilLine, Trash2, TriangleAlert } from "lucide-react";
import { useAiHubAdminModal } from "@/modules/ai-hub/stores/use-ai-hub-admin-modal-store";

export const adminManagePromptsColumn: ColumnDef<Prompts>[] = [
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Prompt Name"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "name",
  },
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Status"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "status",
  },
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Created At"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "createdAt",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const openModal = useAiHubAdminModal((state) => state.onOpen);

      const promptData = row.original;
      const promptId = row.original.id;
      const createdDate: Date = row.getValue("createdAt");
      return (
        <div className="flex items-center justify-between gap-4">
          {format(createdDate, "do 'of' MMM, yyyy")}
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
              <Ellipsis className="font-medium" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left">
              <DropdownMenuItem className="cursor-pointer">
                <Eye />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openModal({ type: "editPrompts", promptData })}
              >
                <PencilLine />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="space-x-2 cursor-pointer"
                onClick={() =>
                  openModal({ type: "deletePrompt", id: promptId })
                }
              >
                <div className="flex items-center gap-2">
                  <Trash2 />
                  Delete
                </div>
                <TriangleAlert className="text-rose-600" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
