import { CheckIcon, icons } from "lucide-react";
import type { Dispatch, PropsWithChildren } from "react";
import { type CreateTaskDialogData, useTaskContext } from "@/lib";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Textarea } from "@/shadcn/ui/textarea";

export function TaskDialogWrapper({ children }: PropsWithChildren) {
  const dialogData = useTaskContext((s) => s.dialogData);
  return (
    <Dialog>
      {children}
      <DialogContent>
        {dialogData &&
          (dialogData.type === "create-task" ? (
            <TaskCreatorDialogContent {...{ dialogData }} />
          ) : (
            <div>Not implemented yet...</div>
          ))}
      </DialogContent>
    </Dialog>
  );
}

function TaskCreatorDialogContent({
  dialogData,
}: {
  dialogData: CreateTaskDialogData;
}) {
  const createTask = useTaskContext((s) => s.createTask);
  const setDialogInputName = useTaskContext((s) => s.setDialogInputName);
  const removeDialog = useTaskContext((s) => s.removeDialog);

  function confirmAddTask() {
    createTask(dialogData.inputName);
    removeDialog();
  }

  return (
    <>
      <DialogHeader className="flex flex-col gap-8">
        <DialogTitle>Create a Task</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-5">
        <DialogInput
          hook={{ value: dialogData.inputName, setValue: setDialogInputName }}
          name="Task"
          placeholder="i.e Eigenvalues & Eigenvectors"
          id="name"
          iconName="Pencil"
          onEnter={() => confirmAddTask()}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="submit"
            className="font-bold"
            disabled={dialogData.inputName.trim() === ""}
            onClick={confirmAddTask}
          >
            <CheckIcon className="stroke-3" /> Confirm
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

export function DialogInput({
  ref,
  disabled,
  hook,
  name,
  placeholder,
  id,
  iconName,
  variant = "input",
  onEnter,
}: {
  ref?: any;
  disabled?: boolean;
  hook?: { value: string; setValue: Dispatch<string> };
  id: string;
  name: string;
  placeholder?: string;
  iconName: keyof typeof icons;
  variant?: "textarea" | "input";
  onEnter?: () => void;
}) {
  const Icon = icons[iconName];
  const VariantInput = { textarea: Textarea, input: Input }[variant];

  return (
    <div className={`flex flex-col gap-2 `}>
      <Label htmlFor={id} className={`pl-1 flex ${disabled && "opacity-30"}`}>
        <Icon className="size-3.5!" /> {name}
      </Label>
      <VariantInput
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        autoComplete="off"
        {...(hook && { value: hook.value })}
        {...{ name, placeholder, disabled, ref }}
        onChange={(e) => hook?.setValue(e.target.value)}
      />
    </div>
  );
}
