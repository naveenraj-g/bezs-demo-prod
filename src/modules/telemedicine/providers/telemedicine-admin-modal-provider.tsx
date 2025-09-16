"use client";

import { useEffect, useState } from "react";
import { CreateDoctorModal } from "../modals/create-doctor-modal";
import { EditDoctorModal } from "../modals/edit-doctor-modal";
import { DeleteDoctorModal } from "../modals/delete-doctor-modal";

export const TelemedicineAdminModalProvider = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateDoctorModal />
      <EditDoctorModal />
      <DeleteDoctorModal />
    </>
  );
};
