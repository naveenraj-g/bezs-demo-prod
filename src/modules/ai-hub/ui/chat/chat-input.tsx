"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleStop, File, Mic, Send, Upload, X } from "lucide-react";
import ActionTooltipProvider from "@/modules/auth/providers/action-tooltip-provider";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { PromptType, RoleType } from "../../types/chat-types";
import { StopIcon } from "@phosphor-icons/react/dist/ssr";
import { ModelSelect } from "../model-select";
import {
  selectedModel,
  useSelectedModelStore,
} from "../../stores/useSelectedModelStore";
import { useSpeechRecognition } from "../../hooks/use-speech-recognition";
import { VoiceWaveAnimation } from "../voice-wave-animation";
import { useScrollToBottom } from "../../hooks/use-scroll-to-bottom";
import { ArrowDownIcon, QuotesIcon, XIcon } from "@phosphor-icons/react";
import { useTextSelection } from "../../hooks/use-text-selection";
import { ChatExamples } from "./chat-examples";
import { toast } from "sonner";
import { useChatContext } from "../../context/chat/context";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command as CMDKCommand,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { examplePrompts } from "../../lib/prompts";

import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import HardBreak from "@tiptap/extension-hard-break";

import { EditorContent, Extension, useEditor } from "@tiptap/react";
import { ChatGreeting } from "./chat-greeting";
import { useChatSession } from "../../hooks/use-chat-session";
import { removeExtraSpaces } from "@/utils/helper";
import { PluginSelect } from "../plugin-select";
import { usePrompt } from "../../hooks/use-prompt";
import { AssistantSelect } from "../assistant-select";
import { assistantStore } from "../../stores/assistantStore";
import { Assistant } from "../../../../../prisma/generated/ai-hub";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId;
  const selectedModel = useSelectedModelStore((state) => state.selectedModel);
  const { scrollToBottom, showButton } = useScrollToBottom();
  const { selectedText, showPopup, handleClearSelection } = useTextSelection();

  const {
    initialPrompt,
    setInitialPrompt,
    runModel,
    currentSession,
    streaming,
    stopGeneration,
    createSession,
    sessions,
  } = useChatContext();

  const { getSessions, sortSessions } = useChatSession();
  const { prompts, isPromptsLoading, isPromptsError } = usePrompt();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextValue, setContextValue] = useState<string>("");

  const selectedModelRef = useRef<selectedModel | null>(null);
  const selectedAssistantRef = useRef<Assistant | null>(
    assistantStore.getState().selectedAssistant
  );
  const contextRef = useRef("");

  const {
    text,
    hasRecoginitionSupport,
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const isNewSession = currentSession?.messages?.length === 0;

  const [attachment, setAttachment] = useState<TAttachment>();
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    contextRef.current = contextValue;
  }, [contextValue]);

  useEffect(() => {
    if (selectedModel) {
      selectedModelRef.current = selectedModel;
    }
  }, [selectedModel]);

  // useEffect(() => {
  //   if (selectedAssistant) {
  //     selectedAssistantRef.current = selectedAssistant;
  //   } else {
  //     selectedAssistantRef.current = null;
  //   }
  // }, [selectedAssistant]);

  useEffect(() => {
    const unsub = assistantStore.subscribe((state) => {
      selectedAssistantRef.current = state.selectedAssistant;
    });

    return unsub;
  }, []);

  const handleRunModel = async (query?: string, clear?: () => void) => {
    if (!query) return;

    if (!sessionId?.toString()) {
      setInitialPrompt(query);

      const latestSession = sortSessions(sessions, "createdAt")?.[0];
      if (latestSession && latestSession?.messages?.length === 0) {
        router.push(`/bezs/ai-hub/ask-ai/${latestSession.id}`);
        return;
      }

      const newSession = await createSession();
      if (newSession?.id) {
        router.push(`/bezs/ai-hub/ask-ai/${newSession.id}`);
        return;
      }

      return;
    }

    runModel({
      role: RoleType.assistant,
      type: PromptType.ask,
      image: attachment?.base64,
      query: removeExtraSpaces(query),
      context: removeExtraSpaces(contextRef.current),
      sessionId: sessionId!.toString(),
      selectedModel: selectedModelRef.current || undefined,
      selectedAssistant: selectedAssistantRef.current || undefined,
    });
    setAttachment(undefined);
    setContextValue("");
    clear?.();
  };

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!hasRunRef.current && initialPrompt && sessionId) {
      hasRunRef.current = true;
      handleRunModel(initialPrompt);
      setInitialPrompt(undefined);
    }
  }, [initialPrompt, sessionId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !fileTypes.includes(file?.type)) {
      toast.error("Invalid format", {
        description: "Please select a valid image (JPEG, PNG, GIF).",
        richColors: true,
      });
      return;
    }

    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const base64String = reader?.result?.split(",")[1];
      setAttachment((prevState) => ({
        ...prevState,
        base64: `data:${file?.type};base64,${base64String}`,
      }));
    };

    if (file) {
      setAttachment((prevState) => ({
        ...prevState,
        file,
      }));

      reader.readAsDataURL(file);
    }
  };

  const shiftEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        "Shift+Enter": (_) => {
          return _.editor.commands.enter();
        },
      };
    },
  });

  const Enter = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: (_) => {
          if (_.editor.getText()?.length > 0) {
            handleRunModel(_.editor.getText(), () => {
              _.editor.commands.clearContent();
            });
          }
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type or Ask anything...",
      }),
      Enter,
      shiftEnter,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
      HardBreak,
    ],
    content: ``,
    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();

      if (text === "/") {
        setOpen(true);
      } else {
        const newHTML = html.replace(
          // /{{{{(.*?)}}}}/g,
          // ` <mark class="prompt-highlight">$1 </mark> `
          /{{{{\s*(.*?)\s*}}}}/g,
          (_, match) =>
            `&nbsp;<mark class="prompt-highlight">${match}</mark>&nbsp;`
        );

        if (newHTML !== html) {
          editor.commands.setContent(newHTML, {
            emitUpdate: true,
            parseOptions: { preserveWhitespace: true },
          });
        }
        setOpen(false);
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    /**
     * ✅ The key fix:
     */
    autofocus: true,
    injectCSS: false,
    editable: true,
    parseOptions: {
      preserveWhitespace: true,
    },
    /**
     * ✅ Avoid immediate render for SSR hydration safety
     */
    immediatelyRender: false,
  });

  useEffect(() => {
    if (text) {
      editor?.commands.setContent(text);
    }
  }, [text]);

  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.commands, editor?.isActive]);

  // editor?.commands.setContent(text)

  const focusToInput = () => {
    editor?.commands.focus("end");
  };

  const clearInput = () => {
    editor?.commands.clearContent();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!sessionId) return;

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    if (prompt !== "") {
      handleRunModel(prompt);
      e.currentTarget.reset();
      setFiles([]);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prevState) => [...selectedFiles, ...prevState]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prevState) => prevState.filter((_, i) => i !== index));
  };

  const renderStopButton = () => {
    if (streaming) {
      return (
        <span>
          <Button
            onClick={() => stopGeneration()}
            variant="secondary"
            size="sm"
            type="button"
          >
            <StopIcon size={20} weight="bold" /> Stop
          </Button>
        </span>
      );
    }
  };

  return (
    <div className="relative w-full">
      {(isNewSession || !sessionId?.toString()) && <ChatGreeting />}
      {showButton && !showPopup && (
        <Button
          onClick={scrollToBottom}
          variant="secondary"
          size="icon"
          className="hover:bg-accent absolute -top-16 rounded-full left-1/2 transform -translate-x-1/2 z-10"
        >
          <ArrowDownIcon size={20} weight="bold" />
        </Button>
      )}
      {showPopup && (
        <div className="flex items-center justify-center absolute -top-16 rounded-full left-1/2 transform -translate-x-1/2">
          <Button
            onClick={() => {
              setContextValue(selectedText);
              handleClearSelection();
              textareaRef?.current?.focus();
            }}
            variant="secondary"
            size="sm"
            className="hover:bg-accent"
          >
            <QuotesIcon size={20} weight="bold" /> Reply
          </Button>
        </div>
      )}
      <div className="bg-zinc-300/30 dark:bg-zinc-700/80 rounded-3xl overflow-hidden p-2 border space-y-2">
        {contextValue && (
          <div className="flex gap-2 justify-between items-center bg-zinc-300 dark:bg-zinc-600 rounded-2xl px-2 py-1">
            <div className="flex items-center gap-2">
              <QuotesIcon size={16} weight="fill" className="shrink-0" />
              <p className="text-sm max-h-20 overflow-y-auto">{contextValue}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setContextValue("")}
              className="shrink-0 hover:bg-transparent dark:hover:bg-transparent"
            >
              <XIcon size={16} weight="bold" />
            </Button>
          </div>
        )}
        {files.length > 0 && (
          <div className="flex gap-2 rounded-xl p-1 overflow-x-auto">
            {files.map((file, index) => {
              const isImageFile = file.type.startsWith("image/");
              const tempImageUrl = isImageFile ? URL.createObjectURL(file) : "";

              return isImageFile ? (
                <div key={index} className="relative basis-12">
                  <Image
                    src={tempImageUrl}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="rounded-xl w-12 h-12 bg-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    type="button"
                    className="text-red-500 bg-red-200 rounded-full absolute -top-0.5 -right-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  key={index}
                  className="flex items-center gap-2 px-1 py-1 bg-zinc-200 dark:bg-zinc-600/50 text-zinc-700 dark:text-white rounded-lg text-sm"
                >
                  <File className="w-8 h-8" />
                  <div className="flex flex-col">
                    <span className="truncate max-w-[100px]">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    type="button"
                    className="cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {attachment?.base64 && attachment?.file && (
          <div className="relative w-fit">
            <Image
              src={attachment.base64}
              alt={attachment.file.name}
              width={48}
              height={48}
              className="rounded-xl w-12 h-12 bg-cover"
            />
            <button
              onClick={() => setAttachment(undefined)}
              type="button"
              className="text-red-500 bg-red-200 rounded-full absolute -top-0.5 -right-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor className="w-full">
            {/* {selectedPrompt && (
              <div className="mb-2 px-2 w-full dark:bg-zinc-600 bg-zinc-300 rounded-2xl">
                <div className="flex items-center justify-between py-1">
                  <p className="text-sm">{selectedPrompt}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPrompt(undefined);
                      // textareaRef.current?.focus();
                      editor?.commands.focus("end")
                    }}
                    className="shrink-0 ml-4 hover:bg-transparent dark:hover:bg-transparent"
                  >
                    <XIcon size={16} weight="bold" />
                  </Button>
                </div>
              </div>
            )} */}
            <>
              <div className="flex items-center gap-2">
                {/* <Textarea
                  ref={textareaRef}
                  name="prompt"
                  placeholder="Type or Ask anything..."
                  required
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCapitalize="off"
                  onChange={(e) => {
                    if (e.target.value === "/") {
                      setOpen(true);
                    }
                  }}
                  defaultValue={text}
                  className="!bg-transparent border-none focus-visible:!border-0 focus-visible:ring-0 shadow-none min-h-9 max-h-24 resize-none"
                /> */}
                <EditorContent
                  autoFocus
                  editor={editor}
                  className="w-full min-h-8 max-h-24 overflow-y-auto outline-none text-sm focus:outline-none p-2 cursor-text [&>*]:leading-6 [&>*]:outline-none wysiwyg"
                />
                {streaming ? (
                  renderStopButton()
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="bg-transparent dark:hover:!bg-zinc-600/50 rounded-full"
                    onClick={() => {
                      handleRunModel(editor?.getText(), () => {
                        editor?.commands.clearContent();
                      });
                    }}
                  >
                    <Send className="dark:text-white !w-[1.15rem] !h-[1.15rem]" />
                  </Button>
                )}
              </div>
            </>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            className="w-56 xxs:w-76 mb-2 p-0 rounded-2xl overflow-hidden"
          >
            <CMDKCommand>
              <CommandInput placeholder="Search..." className="h-9" />
              <CommandEmpty>No prompt found.</CommandEmpty>
              <CommandList className="p-1 max-h-[140px]">
                {/* <CommandItem onScroll={() => {}}>
                  <PlusIcon size={14} weight="bold" className="shrink-0" />{" "}
                  Create New Prompt <Badge>Will add soon</Badge>
                </CommandItem> */}
                {prompts.map((role, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      editor?.commands.setContent(role.description);
                      editor?.commands.insertContent("");
                      editor?.commands.focus("end");
                      // textareaRef.current!.value = role.description;
                      setSelectedPrompt(role.name);
                      // textareaRef.current?.focus();
                      setOpen(false);
                    }}
                  >
                    {index + 1}. {role.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CMDKCommand>
          </PopoverContent>
        </Popover>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ActionTooltipProvider
              label="Add images"
              align="center"
              side="bottom"
            >
              <div>
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  onChange={(e) => handleImageUpload(e)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent dark:hover:!bg-zinc-600/50 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="!w-[1.15rem] !h-[1.15rem]" />
                </Button>
              </div>
            </ActionTooltipProvider>
            <ModelSelect />
            <AssistantSelect />
            <PluginSelect />
          </div>
          {!isListening ? (
            <ActionTooltipProvider label="Dictate" align="center" side="bottom">
              <Button
                size="icon"
                variant="ghost"
                className="bg-transparent dark:hover:!bg-zinc-600/50 rounded-full"
                onClick={startListening}
              >
                <Mic className="!w-[1.15rem] !h-[1.15rem]" />
              </Button>
            </ActionTooltipProvider>
          ) : (
            <div className="flex items-center">
              <VoiceWaveAnimation isListening={isListening} />
              <ActionTooltipProvider
                label="Stop Dictate"
                align="center"
                side="bottom"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-transparent text-red-500 hover:text-red-500 dark:hover:!bg-zinc-600/50 rounded-full"
                  onClick={stopListening}
                >
                  <CircleStop className="!w-[1.15rem] !h-[1.15rem]" />
                </Button>
              </ActionTooltipProvider>
            </div>
          )}
        </div>
      </div>
      {(isNewSession || !sessionId?.toString()) && (
        <ChatExamples
          examples={examplePrompts}
          onExampleClick={(prompt) => {
            handleRunModel(prompt);
          }}
        />
      )}
    </div>
  );
};

// 4:14
