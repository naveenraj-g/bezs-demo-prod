import { prismaTeleMedicine } from "@/lib/prisma";
import { getServerSession } from "@/modules/auth/services/better-auth/action";
import { getPatientAppointments } from "@/modules/telemedicine/serveractions/appointment/appointments-server-action";
import { PatientappointmentsListTable } from "@/modules/telemedicine/ui/tables/patient-appointments-list-table";
import { redirect } from "next/navigation";
import React from "react";

const AppointmentsPage = async () => {
  const session = await getServerSession();

  if (!session) redirect("/");

  const userId = await prismaTeleMedicine.patient.findUnique({
    where: {
      userId: session?.user?.id,
    },
    select: {
      id: true,
    },
  });

  const { appointmentsData, appointmentsCount } = await getPatientAppointments(
    userId?.id
  );

  return (
    <>
      <PatientappointmentsListTable
        appointmentsData={appointmentsData}
        appointmentsCount={appointmentsCount}
      />
    </>
  );
};

export default AppointmentsPage;
