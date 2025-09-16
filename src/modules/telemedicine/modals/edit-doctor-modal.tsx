"use client";

import { useSession } from "@/modules/auth/services/better-auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTelemedicineAdminModal } from "../stores/use-telemedicine-admin-modal-store";
import {
  createAIDoctorFormSchema,
  createDoctorFormSchema,
} from "../schemas/create-doctor-form-schema";
import { CustomInput } from "../../../shared/ui/custom-input";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminRole } from "../utils/roles";
import { useEffect } from "react";
import { useServerAction } from "zsa-react";
import {
  editAiDoctor,
  editHumanDoctor,
} from "../serveractions/admin/doctorActions";
import { useRouter } from "next/navigation";

type CreateDoctorFormSchemaType = z.infer<typeof createDoctorFormSchema>;
type TCreateAIDoctorFormSchema = z.infer<typeof createAIDoctorFormSchema>;

export const EditDoctorModal = () => {
  const session = useSession();
  const router = useRouter();

  const closeModal = useTelemedicineAdminModal((state) => state.onClose);
  const modalType = useTelemedicineAdminModal((state) => state.type);
  const isOpen = useTelemedicineAdminModal((state) => state.isOpen);
  const doctorData = useTelemedicineAdminModal((state) => state.doctorData);

  const isModalOpen = isOpen && modalType === "editDoctor";

  const isHumanDoctor = doctorData?.doctorType === "HUMAN_DOCTOR";
  const isAiDoctor = doctorData?.doctorType === "AI_DOCTOR";

  const HumanDoctorForm = useForm<CreateDoctorFormSchemaType>({
    resolver: zodResolver(createDoctorFormSchema),
    defaultValues: {
      userId: "",
      license_number: "",
      specialization: "",
      phone: "",
      address: "",
    },
  });

  const AIDoctorForm = useForm<TCreateAIDoctorFormSchema>({
    resolver: zodResolver(createAIDoctorFormSchema),
    defaultValues: {
      name: "",
      specialization: "",
      description: "",
      agentPrompt: "",
      voiceId: "",
      img: "",
    },
  });

  useEffect(() => {
    if (isModalOpen && doctorData) {
      if (doctorData.doctorType === "HUMAN_DOCTOR") {
        HumanDoctorForm.reset({
          userId: doctorData.userId!,
          address: doctorData.address!,
          license_number: doctorData.license_number!,
          phone: doctorData.phone!,
          specialization: doctorData.specialization!,
        });
      }

      if (doctorData.doctorType === "AI_DOCTOR") {
        AIDoctorForm.reset({
          agentPrompt: doctorData.agentPrompt!,
          description: doctorData.description!,
          img: doctorData.img!,
          name: doctorData.name!,
          specialization: doctorData.specialization!,
          voiceId: doctorData.voiceId!,
        });
      }
    }
  }, [AIDoctorForm, HumanDoctorForm, doctorData, isModalOpen]);

  const {
    formState: { isSubmitting: isHumanDoctorFormSubmitting },
  } = HumanDoctorForm;

  const {
    formState: { isSubmitting: isAIDoctorFormSubmitting },
  } = AIDoctorForm;

  const { execute: editHumanDoctorServerAction } = useServerAction(
    editHumanDoctor,
    {
      onSuccess() {
        toast.success("Doctor edited successfully!");
      },
      onError(err) {
        console.log(err.err.message);
        toast.error("Something went wrong!");
      },
    }
  );

  const { execute: editAIDoctorServerAction } = useServerAction(editAiDoctor, {
    onSuccess() {
      toast.success("Doctor edited successfully!");
    },
    onError() {
      toast.error("Something went wrong!");
    },
  });

  async function onHumanDoctorSubmit(values: CreateDoctorFormSchemaType) {
    if (session?.data?.user?.role !== adminRole) {
      toast("unauthorized.");
      return;
    }

    const data = {
      id: doctorData!.id,
      ...values,
    };

    await editHumanDoctorServerAction(data);
    router.refresh();
    handleCloseModal();
  }

  async function onAIDoctorSubmit(values: TCreateAIDoctorFormSchema) {
    if (session?.data?.user?.role !== adminRole) {
      toast("unauthorized.");
      return;
    }

    await editAIDoctorServerAction({
      id: doctorData!.id,
      ...values,
    });
    router.refresh();
    handleCloseModal();
  }

  function handleCloseModal() {
    HumanDoctorForm.reset();
    AIDoctorForm.reset();
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center gap-2">
            Edit Doctor
          </DialogTitle>
        </DialogHeader>
        {isHumanDoctor && (
          <div className="mt-4">
            <Form {...HumanDoctorForm}>
              <form
                onSubmit={HumanDoctorForm.handleSubmit(onHumanDoctorSubmit)}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <CustomInput
                    type="input"
                    name="license_number"
                    label="License Number"
                    placeholder="Enter license number"
                    control={HumanDoctorForm.control}
                  />
                  <CustomInput
                    type="input"
                    name="specialization"
                    label="Specialization"
                    placeholder="Enter specialization"
                    control={HumanDoctorForm.control}
                  />
                  <CustomInput
                    type="input"
                    name="phone"
                    label="Phone"
                    placeholder="Enter phone number"
                    control={HumanDoctorForm.control}
                  />
                  <CustomInput
                    type="textarea"
                    name="address"
                    label="Address"
                    placeholder="Enter address"
                    control={HumanDoctorForm.control}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isHumanDoctorFormSubmitting}
                >
                  {isHumanDoctorFormSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⌛</span>
                      Editing...
                    </div>
                  ) : (
                    "Edit Doctor"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {isAiDoctor && (
          <div className="mt-4">
            <Form {...AIDoctorForm}>
              <form
                onSubmit={AIDoctorForm.handleSubmit(onAIDoctorSubmit)}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <CustomInput
                    type="input"
                    name="name"
                    label="Name"
                    placeholder="Enter a name"
                    control={AIDoctorForm.control}
                    className="w-full"
                  />
                  <CustomInput
                    type="input"
                    name="specialization"
                    label="Specialization"
                    placeholder="Enter specialization"
                    control={AIDoctorForm.control}
                  />
                  <CustomInput
                    type="textarea"
                    name="description"
                    label="Description"
                    placeholder="AI Doctor description"
                    control={AIDoctorForm.control}
                  />
                  <CustomInput
                    type="textarea"
                    name="agentPrompt"
                    label="Agent Prompt"
                    placeholder="AI Doctor prompt"
                    control={AIDoctorForm.control}
                  />
                  <CustomInput
                    type="input"
                    name="voiceId"
                    label="Voice Id"
                    placeholder="Enter agent voice id"
                    control={AIDoctorForm.control}
                  />
                  <CustomInput
                    type="input"
                    name="img"
                    label="Image Path"
                    placeholder="Enter image path"
                    control={AIDoctorForm.control}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isAIDoctorFormSubmitting}
                >
                  {isAIDoctorFormSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⌛</span>
                      Editing...
                    </div>
                  ) : (
                    "Edit AI Doctor"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
