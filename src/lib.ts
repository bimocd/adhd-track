import { createContext, useContext, useEffect } from "react";
import { create, useStore } from "zustand";

export function formatSecs(secs: number) {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  function pad(n: number) {
    return n.toString().padStart(2, "0");
  }

  if (hours > 0) {
    return `${hours}h${pad(minutes)}m${pad(seconds)}s`;
  } else if (minutes > 0) {
    return `${minutes}m${pad(seconds)}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else return "";
}

export function $(
  name: string,
  secs: number,
  children: TaskData[] = [],
  id?: string,
): TaskData {
  return {
    name,
    secs,
    id: id ?? name.toLowerCase().split(" ").join("-"),
    open: true,
    children,
  };
}

export const FAKE_TASKS: TaskData[] = [
  $("test the app", 0, [
    $("basic interactions", 0, [
      $("create tasks", 0, [
        $("add root task", 0),
        $("add child task", 0),
        $("add child to closed parent", 0),
        $("add child while timer running", 0),
      ]),
      $("delete tasks", 0, [
        $("delete leaf task", 0),
        $("delete parent with children", 0, [
          $("ensure children removed", 0),
          $("ensure timer stops if active", 0),
        ]),
        $("delete active task", 0),
      ]),
    ]),

    $("nesting behavior", 0, [
      $("expand / collapse", 0, [
        $("toggle parent", 0),
        $("toggle deep child", 0),
        $("toggle mixed open states", 0),
      ]),
      $("deep recursion stress", 0, [
        $("level 3", 0, [
          $("level 4", 0, [
            $("level 5", 0, [
              $("level 6", 0, [
                $("level 7", 0, [
                  $("verify render", 0),
                  $("verify timer still works", 0),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]),

  $("test persistence", 0, [
    $("export / import", 0, [
      $("export json", 0, [$("validate schema", 0), $("pretty vs compact", 0)]),
      $("import json", 0, [
        $("replace existing tasks", 0),
        $("merge tasks", 0),
        $("handle invalid format", 0),
      ]),
    ]),
  ]),

  $("future features", 0, [
    $("task ordering", 0, [$("drag & drop", 0), $("persist order", 0)]),
    $("task metadata", 0, [
      $("tags", 0),
      $("priority", 0),
      $("notes", 0, [$("markdown support", 0), $("autosave", 0)]),
    ]),
    $("analytics", 0, [
      $("time per task", 0),
      $("time per day", 0),
      $("export reports", 0),
    ]),
  ]),
];

export type TaskData = {
  id: string;
  secs: number;
  name: string;
  open: boolean;
  children: TaskData[];
};

export type CreateTaskDialogData = { type: "create-task"; inputName: string };
export type EditTaskDialogData = {
  type: "edit-task";
  inputName: string;
  taskID: string;
};
export type CreateSubTaskDialogData = {
  type: "create-subtask";
  parentID: string;
};
export type DialogData =
  | undefined
  | CreateSubTaskDialogData
  | EditTaskDialogData
  | CreateTaskDialogData;

export type TaskStoreData = {
  dialogData?: DialogData;

  timeInterval?: ReturnType<typeof setInterval>;
  activeTaskID?: string;
  tasks: TaskData[];

  removeDialog: () => void;
  setDialogStateToTaskCreation: () => void;
  setDialogStateToSubTaskCreation: (parentId: string) => void;
  setDialogStateToTaskEdit: (taskID: string) => void;

  renameTask: (taskID: string, newName: string) => void;
  loadTasks: (tasks: TaskData[]) => void;
  createTask: (name: string, parentID?: string) => void;
  toggleTaskOpen: (taskID: string) => void;
  startTask: (taskID: string) => void;
  stopActiveTask: () => void;
  getTask: (taskID: string) => TaskData | undefined;
  finishTask: (taskID: string) => void;
  resetDuration: (taskID: string) => void;
  clearTasks: () => void;
  mockPopulate: () => void;

  setDialogInputName: (inputName: string) => void;

  _recursiveAddOneSecToActiveTask: (tasks: TaskData[]) => TaskData[];
  _recursiveFindTaskAndToggle: (
    tasks: TaskData[],
    taskID: string,
  ) => TaskData[];
};

export function createTaskStore(initialTasks: TaskData[]) {
  return create<TaskStoreData>()((set, get) => ({
    tasks: initialTasks,
    renameTask(taskID, newName) {
      function recursiveRename(tasks: TaskData[]): TaskData[] {
        return tasks.map((task) => {
          if (task.id === taskID) {
            return { ...task, name: newName };
          }
          return {
            ...task,
            children: recursiveRename(task.children),
          };
        });
      }
      set((s) => ({
        tasks: recursiveRename(s.tasks),
      }));
    },
    removeDialog() {
      return set({ dialogData: undefined });
    },
    setDialogInputName(inputName) {
      return set((s) => {
        if (!s.dialogData) throw new Error("No dialog data 1");
        return { dialogData: { ...s.dialogData, inputName } };
      });
    },
    setDialogStateToSubTaskCreation(parentID) {
      return set({
        dialogData: {
          type: "create-subtask",
          parentID,
        },
      });
    },
    setDialogStateToTaskEdit(taskID) {
      return set({
        dialogData: {
          type: "edit-task",
          inputName: "",
          taskID,
        },
      });
    },
    setDialogStateToTaskCreation() {
      return set({
        dialogData: {
          type: "create-task",
          inputName: "",
        },
      });
    },
    loadTasks(tasks) {
      set({ tasks });
    },
    createTask(name, parentID) {
      const newTask = $(name, 0, [], `${Date.now()}`);

      if (!parentID)
        return set((s) => ({
          tasks: [newTask, ...s.tasks],
        }));

      function recursiveAddTask(tasks: TaskData[]): TaskData[] {
        return tasks.map((task) => {
          if (task.id === parentID) {
            return { ...task, children: [...task.children, newTask] };
          }
          return {
            ...task,
            children: recursiveAddTask(task.children),
          };
        });
      }
      set((s) => ({
        tasks: recursiveAddTask(s.tasks),
      }));
    },
    clearTasks() {
      get().stopActiveTask();
      return set({ tasks: [] });
    },
    mockPopulate() {
      get().stopActiveTask();
      return set({ tasks: FAKE_TASKS });
    },
    stopActiveTask() {
      const { timeInterval } = get();
      clearInterval(timeInterval);
      set({ activeTaskID: undefined, timeInterval: undefined });
    },
    _recursiveAddOneSecToActiveTask(tasks: TaskData[]): TaskData[] {
      const { activeTaskID, _recursiveAddOneSecToActiveTask } = get();
      return tasks.map((task) => {
        if (task.id === activeTaskID) {
          return { ...task, secs: task.secs + 1 };
        }
        return {
          ...task,
          children: _recursiveAddOneSecToActiveTask(task.children),
        };
      });
    },
    resetDuration(taskID) {
      function recursiveReset(tasks: TaskData[]): TaskData[] {
        return tasks.map((task) => {
          if (task.id === taskID) {
            return { ...task, secs: 0 };
          }
          return {
            ...task,
            children: recursiveReset(task.children),
          };
        });
      }
      set((s) => ({
        tasks: recursiveReset(s.tasks),
      }));
    },
    startTask(taskID) {
      const { activeTaskID, stopActiveTask, _recursiveAddOneSecToActiveTask } =
        get();
      if (activeTaskID === taskID) return;
      stopActiveTask();
      set({
        activeTaskID: taskID,
        timeInterval: setInterval(
          () => set({ tasks: _recursiveAddOneSecToActiveTask(get().tasks) }),
          1000,
        ),
      });
    },
    finishTask(taskID) {
      const { activeTaskID, stopActiveTask } = get();
      function recursiveRemove(tasks: TaskData[]): TaskData[] {
        return tasks
          .filter((task) => task.id !== taskID)
          .map((task) => {
            if (task.id === activeTaskID) stopActiveTask();
            return {
              ...task,
              children: recursiveRemove(task.children),
            };
          });
      }
      set((s) => ({
        tasks: recursiveRemove(s.tasks),
      }));
    },
    _recursiveFindTaskAndToggle(tasks, taskID) {
      return tasks.map((task) => {
        return {
          ...task,
          ...(task.id === taskID
            ? { open: !task.open }
            : {
                children: get()._recursiveFindTaskAndToggle(
                  task.children,
                  taskID,
                ),
              }),
        };
      });
    },
    toggleTaskOpen(taskID) {
      set((s) => {
        return {
          tasks: get()._recursiveFindTaskAndToggle(s.tasks, taskID),
        };
      });
    },
    getTask(taskID) {
      function recursiveFind(tasks: TaskData[]): TaskData | undefined {
        for (const task of tasks) {
          if (task.id === taskID) return task;
          const found = recursiveFind(task.children);
          if (found) return found;
        }
        return undefined;
      }
      return recursiveFind(get().tasks);
    },
  }));
}

export type TaskStore = ReturnType<typeof createTaskStore>;
export const TaskContext = createContext<TaskStore | null>(null);

export function useTaskContext<T>(selector: (state: TaskStoreData) => T): T {
  const store = useContext(TaskContext);
  if (!store) throw new Error("Missing TaskContext.Provider in the tree");
  return useStore(store, selector);
}

export function useDevToolsStateEffect(store: TaskStore) {
  useEffect(() => {
    (window as any).gst = store.getState;
  }, []);
}

export function usePageTabEffect() {
  // Change favicon to either grey.svg or red.svg depending on whether a task is active
  const activeTaskID = useTaskContext((s) => s.activeTaskID);
  const activeTask = useTaskContext((s) =>
    s.activeTaskID ? s.getTask(s.activeTaskID) : undefined,
  );

  useEffect(() => {
    const link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) throw new Error("Favicon link element not found");
    link.href = activeTask ? "/active.svg" : "/inactive.svg";
    window.document.title = !activeTask
      ? "ADHD Tracker"
      : `${formatSecs(activeTask.secs)} → ${activeTask.name}`;
  }, [activeTaskID, activeTask?.secs, activeTask?.name]);
}
