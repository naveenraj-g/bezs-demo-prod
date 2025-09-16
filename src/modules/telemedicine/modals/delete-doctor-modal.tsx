"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useSession } from "@/modules/auth/services/better-auth/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useServerAction } from "zsa-react";
import { useTelemedicineAdminModal } from "../stores/use-telemedicine-admin-modal-store";
import { deleteDoctor } from "../serveractions/admin/doctorActions";
import { useRouter } from "next/navigation";

export const DeleteDoctorModal = () => {
  const router = useRouter();
  const closeModal = useTelemedicineAdminModal((state) => state.onClose);
  const modalType = useTelemedicineAdminModal((state) => state.type);
  const doctorId = useTelemedicineAdminModal((state) => state.doctorId) || "";
  const isOpen = useTelemedicineAdminModal((state) => state.isOpen);

  const session = useSession();

  const isModalOpen = isOpen && modalType === "deleteDoctor";

  const { execute, isPending } = useServerAction(deleteDoctor);

  async function handleAppDelete() {
    if (!session) {
      toast.error("Unauthorized!", {
        richColors: true,
      });
      return;
    }

    try {
      const [, err] = await execute({ id: doctorId });

      if (err) {
        throw new Error(
          typeof err === "string" ? err : err?.message || JSON.stringify(err)
        );
      }
      toast.success("Doctor deleted!", {
        richColors: true,
      });
      router.refresh();
      closeModal();
    } catch (err) {
      toast.error("Error!", {
        description: (err as Error)?.message,
        richColors: true,
      });
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-2 text-2xl text-center">
            Delete Doctor
          </DialogTitle>
          <DialogDescription className="mb-6 text-md">
            Are you sure you want to delete this Doctor? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter className="space-x-2">
            <Button
              className="cursor-pointer"
              onClick={handleAppDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  Delete <Loader2 className="animate-spin" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
            <DialogClose asChild>
              <Button className="cursor-pointer" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
