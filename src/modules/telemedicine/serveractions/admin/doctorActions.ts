"use server";

import { prismaMain, prismaTeleMedicine } from "@/lib/prisma";
import { getServerSession } from "@/modules/auth/services/better-auth/action";
import {
  CreateDoctorDataType,
  TCreateAIDoctorData,
} from "../../types/data-types";
import {
  createAIDoctorFormSchema,
  createDoctorFormSchema,
  editAIDoctorFormSchema,
  editHumanDoctorFormSchema,
} from "../../schemas/create-doctor-form-schema";
import { findOrgId } from "../patient/patient-profile-actions";
import { headers } from "next/headers";
import { adminRole } from "../../utils/roles";
import { authProcedures } from "@/shared/server-actions/server-action";
import z from "zod";

export async function getAllDoctors() {
  const session = await getServerSession();

  if (session?.user?.role !== adminRole) {
    throw new Error("Unauthorized");
  }

  try {
    const doctorsData = await prismaTeleMedicine.doctor.findMany();

    const doctorsSize = await prismaTeleMedicine.doctor.count();

    return { doctorsData, doctorsSize };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Failed to get data");
  }
}

export async function getAllUsersWithTelemedicineDoctorRole() {
  const session = await getServerSession();
  const referer = (await headers()).get("referer");
  const url = new URL(referer!);
  const pathname = url.pathname;

  const pathSplitedArray = pathname.split("/");
  const appSlug = `/${pathSplitedArray[1]}/${pathSplitedArray[2]}`;

  const orgId = await findOrgId(session?.userRBAC, appSlug);

  if (session?.user?.role !== adminRole) {
    throw new Error("Unauthorized");
  }

  try {
    const [doctorRoleData, allOrgDoctorData] = await Promise.all([
      prismaMain.rBAC.findMany({
        where: {
          organizationId: orgId,
          role: {
            name: "telemedicine-doctor",
          },
        },
        include: {
          role: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
        },
      }),
      prismaTeleMedicine.doctor.findMany({
        where: {
          orgId,
        },
        select: {
          userId: true,
        },
      }),
    ]);

    const data = doctorRoleData.filter((data) => {
      const doctorData = allOrgDoctorData.find(
        (docData) => docData.userId === data.userId
      );

      return !doctorData;
    });

    return data;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Failed to get data");
  }
}

export async function createDoctor(data: CreateDoctorDataType, userData: any) {
  const session = await getServerSession();

  if (session?.user?.role !== adminRole) {
    throw new Error("Unauthorized");
  }

  const validateData = createDoctorFormSchema.safeParse(data);

  if (!validateData.success) {
    throw new Error("Invalid data");
  }

  await prismaTeleMedicine.doctor.create({
    data: {
      ...validateData.data,
      ...userData,
    },
  });
}

export async function createAIDoctor(data: TCreateAIDoctorData) {
  const session = await getServerSession();
  const referer = (await headers()).get("referer");
  const url = new URL(referer!);
  const pathname = url.pathname;

  const pathSplitedArray = pathname.split("/");
  const appSlug = `/${pathSplitedArray[1]}/${pathSplitedArray[2]}`;

  const orgId = await findOrgId(session?.userRBAC, appSlug);

  if (session?.user?.role !== adminRole) {
    throw new Error("Unauthorized");
  }

  const validateData = createAIDoctorFormSchema.safeParse(data);

  if (!validateData.success) {
    throw new Error("Invalid data");
  }

  await prismaTeleMedicine.doctor.create({
    data: {
      ...validateData.data,
      orgId,
      doctorType: "AI_DOCTOR",
    },
  });
}

export const editHumanDoctor = authProcedures
  .createServerAction()
  .input(editHumanDoctorFormSchema)
  .handler(async ({ input }) => {
    const { userId, id, ...data } = input;

    try {
      await prismaTeleMedicine.doctor.update({
        where: {
          id,
          userId,
        },
        data: {
          ...data,
        },
      });
    } catch (err) {
      throw new Error(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : JSON.stringify(err)
      );
    }
  });

export const editAiDoctor = authProcedures
  .createServerAction()
  .input(editAIDoctorFormSchema)
  .handler(async ({ input }) => {
    const { id, ...data } = input;

    try {
      await prismaTeleMedicine.doctor.update({
        where: {
          id,
        },
        data: {
          ...data,
        },
      });
    } catch (err) {
      throw new Error(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : JSON.stringify(err)
      );
    }
  });

export const deleteDoctor = authProcedures
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const { id } = input;

    try {
      await prismaTeleMedicine.doctor.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      throw new Error(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : JSON.stringify(err)
      );
    }
  });
