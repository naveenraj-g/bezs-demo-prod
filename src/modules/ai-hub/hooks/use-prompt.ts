"use client";

import { useEffect, useState } from "react";
import { useServerAction } from "zsa-react";
import { Prompts } from "../../../../prisma/generated/ai-hub";
// import { getPrompts } from "../serveractions/admin-server-actions";
import { getPrompts } from "../serveractions/prompts";

export const usePrompt = () => {
  const [prompts, setPrompts] = useState<Prompts[]>([]);

  const {
    execute,
    isError: isPromptsError,
    isPending: isPromptsLoading,
  } = useServerAction(getPrompts);

  useEffect(() => {
    (async () => {
      const [data] = await execute();
      setPrompts(data?.prompts || []);
    })();
  }, [execute]);

  return { prompts, isPromptsError, isPromptsLoading };
};
