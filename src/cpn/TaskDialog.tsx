import { icons } from "lucide-react";
import { AnimatePresence } from "motion/react";
import {
  type ComponentProps,
  type PropsWithChildren,
  useRef,
  useState,
} from "react";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import {
  type CreateSubTaskDialogData,
  type CreateTaskDialogData,
  type EditTaskDialogData,
  useTaskContext,
} from "../lib";
import { DialogInput } from "./Dialog";

// TODO: simplify, too much repetition
export function TaskDialog({ children }: PropsWithChildren) {
  const dialogData = useTaskContext((s) => s.dialogData);
  const removeDialog = useTaskContext((s) => s.removeDialog);

  return (
    <Dialog
      open={typeof dialogData !== "undefined"}
      onOpenChange={(open) => !open && removeDialog()}
    >
      {children}
      <AnimatePresence>
        {dialogData &&
          (() => {
            switch (dialogData.type) {
              case "create-task":
                return <CreateTaskDialogContent {...{ dialogData }} />;
              case "create-subtask":
                return <CreateSubTaskDialogContent {...{ dialogData }} />;
              case "edit-task":
                return <EditTaskDialogContent {...{ dialogData }} />;
            }
          })()}
      </AnimatePresence>
    </Dialog>
  );
}

const $presetConfirmButton = {
  submit: true,
  icon: "CheckCheck",
  text: "Confirm",
} as const;

const $presetTitleInput: DialogInputProps = {
  id: "name",
  name: "Name",
  iconName: "TextCursorInput",
};

function CreateSubTaskDialogContent({
  dialogData,
}: {
  dialogData: CreateSubTaskDialogData;
}) {
  const [name, setName] = useState("");
  const removeDialog = useTaskContext((s) => s.removeDialog);
  const createTask = useTaskContext((s) => s.createTask);

  function isNameValid() {
    return name.trim() === "";
  }

  function confirmCreateTask() {
    createTask(name, dialogData.parentID);
    removeDialog();
  }

  return (
    <RawDialogContent
      data={{
        title: "Create SubTask",
        inputs: [
          {
            ...$presetTitleInput,
            hook: {
              value: name,
              setValue: setName,
            },
            onEnter: confirmCreateTask,
          },
        ],
        buttons: [
          {
            ...$presetConfirmButton,
            disabled: isNameValid(),
            onClick: confirmCreateTask,
          },
        ],
      }}
    />
  );
}

function EditTaskDialogContent({
  dialogData,
}: {
  dialogData: EditTaskDialogData;
}) {
  const task = useTaskContext((s) => s.getTask(dialogData.taskID));
  const renameTask = useTaskContext((s) => s.renameTask);
  const removeDialog = useTaskContext((s) => s.removeDialog);
  const setDialogInputEditName = useTaskContext((s) => s.setDialogInputEditName);

  if (!task) throw new Error(`wtf no task for task ID ${dialogData.taskID}`);

  function onConfirm() {
    renameTask(dialogData.taskID, dialogData.inputName)
    removeDialog()
  }
  return (
    <RawDialogContent
      data={{
        title: "Edit Task",
        inputs: [
          {
            ...$presetTitleInput,
            placeholder: task.title,
            onEnter: onConfirm,
            hook: {
              value: dialogData.inputName,
              setValue: setDialogInputEditName,
            },
          },
        ],
        buttons: [{
          ...$presetConfirmButton,
          disabled: dialogData.inputName.trim() === "",
          onClick: onConfirm
        }],
      }}
    />
  );
}

function CreateTaskDialogContent({
  dialogData,
}: {
  dialogData: CreateTaskDialogData;
}) {
  const createTask = useTaskContext((s) => s.createTask);
  const removeDialog = useTaskContext((s) => s.removeDialog);
  const setDialogInputName = useTaskContext((s) => s.setDialogInputName);

  function onConfirm() {
    if (!dialogData) throw new Error("No dialog Data");
    createTask(dialogData.inputName);
    removeDialog();
  }

  return (
    <RawDialogContent
      data={{
        title: "Create a Task",
        inputs: [
          {
            ...$presetTitleInput,
            hook: {
              value: dialogData.inputName,
              setValue: setDialogInputName,
            },
            onEnter: onConfirm,
          },
        ],
        buttons: [
          {
            ...$presetConfirmButton,
            disabled: dialogData.inputName.trim() === "",
            onClick: onConfirm,
          },
        ],
      }}
    />
  );
}

type DialogInputProps = ComponentProps<typeof DialogInput>;
type DialogButtonProps = {
  submit?: boolean;
  onClick?: VoidFunction;
  icon: keyof typeof icons;
  disabled?: boolean;
  text: string;
};
type RawDialogContentData = {
  title?: string;
  inputs?: DialogInputProps[];
  buttons?: DialogButtonProps[];
};

function RawDialogContent({ data }: { data: RawDialogContentData }) {
  const removeDialog = useTaskContext((s) => s.removeDialog);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DialogContent
      onOpenAutoFocus={(event) => {
        event.preventDefault();

        const input = inputRef.current as HTMLInputElement;
        if (!input) return;

        const length = input.value.length;
        input.focus();
        input.setSelectionRange(length, length);
      }}
    >
      {data.title && (
        <DialogHeader className="flex flex-col gap-8 pb-5">
          <DialogTitle>{data.title}</DialogTitle>
        </DialogHeader>
      )}
      {data.inputs && (
        <div className="flex flex-col gap-5">
          {data.inputs.map((inp) => (
            <DialogInput ref={inputRef} key={inp.id} {...inp} />
          ))}
        </div>
      )}
      {data.buttons && (
        <DialogFooter>
          {data.buttons.map((btn) => {
            const Icon = icons[btn.icon];
            return (
              <Button
                key={btn.text}
                {...(btn.submit && { type: "submit" })}
                className="font-bold cursor-pointer"
                disabled={btn.disabled}
                onClick={btn.onClick ?? removeDialog}
              >
                <Icon className="stroke-3" /> {btn.text}
              </Button>
            );
          })}
        </DialogFooter>
      )}
    </DialogContent>
  );
}
