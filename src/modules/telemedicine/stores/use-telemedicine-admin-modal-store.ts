import { create } from "zustand";

export type ModalType = "createDoctor" | "editDoctor" | "deleteDoctor";

import { Doctor } from "../../../../prisma/generated/telemedicine";

interface TelemedicineAdminStore {
  type: ModalType | null;
  isOpen: boolean;
  appointmentId?: number | string;
  doctorId?: string;
  doctorData?: Doctor | null;
  trigger: number;
  incrementTrigger: () => void;
  onOpen: (props: {
    type: ModalType;
    appointmentId?: number | string;
    doctorId?: string;
    doctorData?: Doctor | null;
  }) => void;
  onClose: () => void;
}

export const useTelemedicineAdminModal = create<TelemedicineAdminStore>(
  (set) => ({
    type: null,
    isOpen: false,
    trigger: 0,
    doctorData: null,
    incrementTrigger: () => set((state) => ({ trigger: state.trigger + 1 })),
    onOpen: ({ type, appointmentId = "", doctorId = "", doctorData = null }) =>
      set({
        isOpen: true,
        type,
        appointmentId,
        doctorId,
        doctorData,
      }),
    onClose: () =>
      set({
        type: null,
        isOpen: false,
        appointmentId: "",
        doctorId: "",
        doctorData: null,
      }),
  })
);
