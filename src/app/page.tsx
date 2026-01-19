"use client";

import { HandIcon, MousePointerClickIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { RightClickMenu, type RightClickMenuItem } from "@/cpn/RightClickMenu";
import { motionProps } from "@/motion";
import { useIsMobile } from "@/shadcn/hooks/use-mobile";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import { Spinner } from "@/shadcn/ui/spinner";
import { TaskDialog } from "../cpn/TaskDialog";
import { TaskList } from "../cpn/TaskList";
import {
  createTaskStore,
  TaskContext,
  type TaskObject,
  useDevToolsStateEffect,
  usePageTabEffect,
  useTaskContext,
} from "../lib";

export default function MainPage() {
  const [store] = useState(() => createTaskStore([]));
  const [lsTasks, setLSTasks] = useLocalStorage<TaskObject[]>("tasks", []);
  const [loading, setLoading] = useState(true);

  const loadTasks = useStore(store, (s) => s.loadTasks);
  const tasks = useStore(store, (s) => s.tasks);

  useEffect(() => {
    setLoading(false);
    if (lsTasks.length) loadTasks(lsTasks);
  }, []);

  useEffect(() => {
    setLSTasks(tasks);
  }, [JSON.stringify(tasks)]);

  useDevToolsStateEffect(store);

  return (
    <TaskContext.Provider value={store}>
      {loading ? <LoadingPage key="loading" /> : <ClientPage key="loaded" />}
    </TaskContext.Provider>
  );
}

export function LoadingPage() {
  return (
    <motion.div
      {...motionProps}
      className="w-screen h-screen flex flex-col justify-center items-center opacity-50 gap-2"
    >
      <Spinner className="size-3.5!" strokeWidth={4} />
      Loading...
    </motion.div>
  );
}

export function ClientPage() {
  const tasksJSON = useTaskContext((s) => JSON.stringify(s.tasks, null, 2));
  const rootTaskIDs = useTaskContext(useShallow((s) => s.getRootTaskIDs()));
  const isEmpty = rootTaskIDs.length === 0

  const clearTasks = useTaskContext((s) => s.clearTasks);
  const mockPopulate = useTaskContext((s) => s.mockPopulate);
  const setDialogStateToTaskCreation = useTaskContext(
    (s) => s.setDialogStateToTaskCreation,
  );

  usePageTabEffect();

  function handleDownload() {

    const blob = new Blob([tasksJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `adhd-tracker-${Date.now()}`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const menu: RightClickMenuItem[] = [
    {
      iconName: "Plus",
      title: "Create Task",
      onClick: setDialogStateToTaskCreation,
    },
    "-",
    {
      iconName: "BrushCleaning",
      title: "Clear",
      onClick: clearTasks,
    },
    {
      iconName: "TestTubeDiagonal",
      title: "Test mock data",
      onClick: mockPopulate,
    },
    {
      iconName: "Download",
      title: "Export (JSON)",
      onClick: handleDownload,
    },
  ] as const;

  return (
    <TaskDialog>
      <RightClickMenu {...{ menu }}>
        <ScrollArea>
          <div className="w-screen min-h-screen flex! justify-center">
            <div className="w-full max-w-lg flex p-2 py-10">
              {isEmpty ? (
                <EmptyPage key="empty" />
              ) : (
                <TaskList key="notempty" taskIDs={rootTaskIDs} />
              )}
            </div>
          </div>
        </ScrollArea>
      </RightClickMenu>
    </TaskDialog>
  );
}

export function EmptyPage() {
  const isMobile = useIsMobile();
  const Icon = isMobile ? HandIcon : MousePointerClickIcon;

  return (
    <div className="w-full h-full flex items-center justify-center p-5 gap-2 opacity-50 ">
      <Icon key="icon" className="size-3.5" />
      <span key="text">
        {isMobile
          ? "Press & Hold to add/modify a task"
          : "Right Click to add/modify a task"}
      </span>
    </div>
  );
}
