"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTelemedicineAdminModal } from "@/modules/telemedicine/stores/use-telemedicine-admin-modal-store";
import { TanstackTableColumnSorting } from "@/shared/ui/table/tanstack-table-column-sorting";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  EllipsisVertical,
  PencilLine,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Doctor } from "../../../../../../prisma/generated/telemedicine";

export const AdminDoctorTableColumn: ColumnDef<Doctor>[] = [
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Name"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "name",
  },
  {
    header: "LICENSE",
    accessorKey: "license_number",
    cell: ({ row }) => {
      const licenseNumber = row.getValue("license_number");

      return licenseNumber ? (
        licenseNumber
      ) : (
        <span className="inline-block text-center w-full">-</span>
      );
    },
  },
  {
    header: "PHONE",
    accessorKey: "phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone");

      return phone ? (
        phone
      ) : (
        <span className="inline-block text-center w-full">-</span>
      );
    },
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => {
      const email = row.getValue("email");

      return email ? (
        email
      ) : (
        <span className="inline-block text-center w-full">-</span>
      );
    },
  },
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Specialization"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "specialization",
  },
  {
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <TanstackTableColumnSorting
          label="Joined Date"
          column={column}
          isSorted={isSorted}
        />
      );
    },
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date: Date = row.getValue("created_at");
      const formattedDate = format(date, "dd-MMM-yyyy");

      return formattedDate;
    },
  },
  {
    header: "Actions",
    id: "action",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const openModal = useTelemedicineAdminModal((state) => state.onOpen);
      const doctorData = row.original;
      const id: string = row.original.id;

      return (
        <div className="flex items-center gap-1">
          {/* <Button
            size="sm"
            className="rounded-full"
            //   onClick={() =>
            //     openModal({ type: "viewAppointment", appointmentId: id })
            //   }
          >
            View
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "ghost" }),
                "rounded-full"
              )}
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openModal({ type: "editDoctor", doctorData })}
              >
                <PencilLine />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="space-x-2 cursor-pointer"
                onClick={() =>
                  openModal({ type: "deleteDoctor", doctorId: id })
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
