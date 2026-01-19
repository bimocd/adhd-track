import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { motionProps } from "@/motion";
import { formatSecs, type TaskData, useTaskContext } from "../lib";
import { RightClickMenu, type RightClickMenuItem } from "./RightClickMenu";
import { TaskList } from "./TaskList";

export function Task({ task }: { task: TaskData }) {
  const toggleTaskOpen = useTaskContext((s) => s.toggleTaskOpen);

  const activeTaskID = useTaskContext((s) => s.activeTaskID);
  const isActive = useTaskContext((s) => s.activeTaskID === task.id);
  const startTask = useTaskContext((s) => s.startTask);
  const stopActiveTask = useTaskContext((s) => s.stopActiveTask);
  const finishTask = useTaskContext((s) => s.finishTask);
  const resetDuration = useTaskContext((s) => s.resetDuration);

  const setDialogStateToTaskEdit = useTaskContext(
    (s) => s.setDialogStateToTaskEdit,
  );
  const setDialogStateToSubTaskCreation = useTaskContext(
    (s) => s.setDialogStateToSubTaskCreation,
  );

  const menu: RightClickMenuItem[] = [
    isActive
      ? {
        iconName: "TimerOff",
        title: "Stop",
        onClick: () => stopActiveTask(),
      }
      : activeTaskID
        ? {
          iconName: "ArrowLeftRight",
          title: "Switch",
          onClick: () => startTask(task.id),
        }
        : {
          iconName: "Timer",
          title: "Start",
          onClick: () => startTask(task.id),
        },
    {
      iconName: "Pencil",
      title: "Edit",
      onClick: () => setDialogStateToTaskEdit(task.id),
    },

    "-",

    {
      iconName: "CornerDownRight",
      title: "Create sub-task",
      onClick: () => setDialogStateToSubTaskCreation(task.id),
    },

    "-",

    {
      iconName: "TimerReset",
      title: "Reset",
      onClick: () => resetDuration(task.id),
    },

    "-",

    {
      iconName: "Copy",
      title: "Copy Title",
      onClick: () => navigator.clipboard.writeText(task.name),
    },

    "-",

    {
      danger: true,
      iconName: "Trash",
      title: "Finish / Delete",
      onClick: () => finishTask(task.id),
    },
  ] as const;

  const ChevronIcon = task.open ? ChevronDown : ChevronUp;
  const isParent = task.children.length > 0
  return (
    <RightClickMenu {...{ menu }}>
      <motion.div
        {...motionProps}
        whileHover={{ scale: 0.995, opacity: 0.95, borderStyle: "dashed" }}
        tabIndex={0}
        className={`flex flex-col
          px-1.5 rounded-[2rem]
          corner-squircle
          ${isActive
            ? "bg-primary scale-[102%] py-1 shadow shadow-primary text-primary-foreground"
            : "bg-foreground/3 border"
          }
            duration-75
          group/card`}
      >
        <div className={`flex items-center justify-between text-lg`}>
          <div
            className={`px-2 p-1 ${isActive && "font-extrabold"} w-full text-wrap wrap-break-word`}
          >
            <span>{task.name}</span>
            <span className="opacity-50 text-xs pl-1.5 font-medium">
              {formatSecs(task.secs)}
            </span>
          </div>
          <div className="flex items-center">
            {isParent && (
              <ChevronIcon
                onClick={() => toggleTaskOpen(task.id)}
                className={`stroke-3 size-2/3 stroke-foreground/50`}
              />
            )}
          </div>
        </div>
        <AnimatePresence>
          {isParent && task.open && <motion.div {...motionProps} className="pl-.5">
            <TaskList tasks={task.children} />
          </motion.div>
          }
        </AnimatePresence>
      </motion.div>
    </RightClickMenu>
  );
}
