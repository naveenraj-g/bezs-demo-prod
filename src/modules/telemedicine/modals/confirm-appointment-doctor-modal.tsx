"use client";

import { useSession } from "@/modules/auth/services/better-auth/auth-client";
import { useRouter } from "next/navigation";
import { useTelemedicineDoctorModal } from "../stores/use-telemedicine-doctor-modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmPatientAppointment } from "../serveractions/doctor/appointment-actions";
import { ModalAppointmentDetails } from "../ui/doctor/modal-appointment-details";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const ConfirmAppointmentDoctorModal = () => {
  const session = useSession();
  const router = useRouter();

  const closeModal = useTelemedicineDoctorModal((state) => state.onClose);
  const appointmentId =
    useTelemedicineDoctorModal((state) => state.appointmentId) || "";
  const appointmentData = useTelemedicineDoctorModal(
    (state) => state.appointmentData
  );
  const modalType = useTelemedicineDoctorModal((state) => state.type);
  const isOpen = useTelemedicineDoctorModal((state) => state.isOpen);

  const isModalOpen = isOpen && modalType === "confirmAppointment";

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleConfirmAppointment() {
    if (!session) {
      return;
    }

    try {
      setIsLoading(true);
      await confirmPatientAppointment(
        typeof appointmentId === "string"
          ? Number(appointmentId)
          : appointmentId
      );
      toast("Appointment Confirmed.");
      router.refresh();
      handleCloseModal();
    } catch (err) {
      toast("Error", {
        description: (err as Error)?.message,
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCloseModal() {
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Are you sure to confirm this appointment?
          </DialogDescription>
        </DialogHeader>
        {appointmentData ? (
          <ModalAppointmentDetails appointmentData={appointmentData} />
        ) : (
          <p>Details for this appointment are not yet available.</p>
        )}
        <DialogFooter>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleConfirmAppointment}
              disabled={isLoading}
            >
              Confirm
              {isLoading && <Loader2 className="animate-spin" />}
            </Button>
            <Button
              size="sm"
              onClick={() => handleCloseModal()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
