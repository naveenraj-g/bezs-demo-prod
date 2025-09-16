import { prismaFileNest, prismaTeleMedicine } from "@/lib/prisma";
import { getServerSession } from "@/modules/auth/services/better-auth/action";
import { PatientProfile } from "@/modules/telemedicine/ui/patient-profile";
import { getAppSlugServerOnly } from "@/utils/getAppSlugServerOnly";
import { redirect } from "next/navigation";

const PatientProfilePage = async () => {
  const session = await getServerSession();

  const { appSlug } = await getAppSlugServerOnly();

  if (!session) {
    redirect("/");
  }

  const profileData = await prismaTeleMedicine.patient.findUnique({
    where: {
      userId: session?.user?.id,
    },
  });

  const profilePicData = await prismaFileNest.userFile.findFirst({
    where: {
      userId: session.user.id,
      appSlug,
      referenceType: "PROFILE",
    },
  });

  return (
    <div className="flex justify-center">
      <PatientProfile
        data={profileData!}
        type={!profileData ? "create" : "update"}
        user={session?.user}
        profilePicData={profilePicData}
      />
    </div>
  );
};

export default PatientProfilePage;
