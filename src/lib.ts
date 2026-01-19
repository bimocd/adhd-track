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


export function $task(title: string, secs: number, parentId?: string, id?: string): TaskObject {
  return {
    title, secs, parentId, open: true, id: id ?? title.toLowerCase().split(" ").join("-"),
  }
}

export const FAKE_TASKS = [
  $task("School", 1835),
  $task("Physics", 193, "school")
]



/* 
TODO: History
TODO: Undo

TODO: Fix way of storing tasks on zustand & localstorage from tree to tables, from
    - ```
    {
      title: ..,
      children: [
        {
          title: ...,
          children: [...]
        },
        {
          title: ...,
          children: [...]
        }
      ], {...}
    }
    ```
to
  - ```
    [
      { title: ..., parentId: ...},
      { title: ..., parentId: ...},
      ...
    ]
    ```
    */
export type TaskObject = {
  id: string;
  secs: number;
  title: string;
  open: boolean;
  parentId?: string;
};

export type CreateTaskDialogData = { type: "create-task"; inputName: string };
export type EditTaskDialogData = { type: "edit-task"; inputName: string; taskID: string };
export type CreateSubTaskDialogData = { type: "create-subtask"; parentID: string; };

export type DialogData =
  | CreateSubTaskDialogData
  | EditTaskDialogData
  | CreateTaskDialogData
  | undefined

export type TaskStoreData = {
  dialogData?: DialogData;

  timeInterval?: ReturnType<typeof setInterval>;
  activeTaskID?: string;
  tasks: TaskObject[];

  removeDialog: () => void;
  setDialogStateToTaskCreation: () => void;
  setDialogStateToSubTaskCreation: (parentId: string) => void;
  setDialogStateToTaskEdit: (taskID: string) => void;

  renameTask: (taskID: string, newName: string) => void;
  loadTasks: (tasks: TaskObject[]) => void;
  createTask: (name: string, parentID?: string) => void;
  toggleTaskOpen: (taskID: string) => void;
  startTask: (taskID: string) => void;
  stopActiveTask: () => void;
  getTask: (taskID: string) => TaskObject | undefined;
  finishTask: (taskID: string) => void;
  resetDuration: (taskID: string) => void;
  clearTasks: () => void;
  mockPopulate: () => void;
  getChildrenIDs: (taskID: string) => string[];
  getRootTaskIDs: () => string[];

  setDialogInputName: (inputName: string) => void;
  setDialogInputEditName: (inputName: string) => void;

  incrementOneSecToActiveTask: () => void;
};

export const createTaskStore = (initialTasks: TaskObject[]) => create<TaskStoreData>()((set, get) => ({
  tasks: initialTasks,
  setDialogInputEditName(inputName) {
    return get().setDialogInputName(inputName);
  },
  getRootTaskIDs() {
    return get().tasks.filter(task => !task.parentId).map(c => c.id)
  },
  getChildrenIDs(taskID: string) {
    return get().tasks.filter(task => task.parentId === taskID).map(c => c.id)
  },
  renameTask(taskID, newTitle) {
    return set((s) => {
      const newTasks = [...s.tasks];
      for (const task of newTasks) {
        if (task.id === taskID) {
          task.title = newTitle
          break;
        }
      }
      return { tasks: newTasks };
    });
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
    return set(s => {
      const task = s.getTask(taskID)
      if (!task) throw new Error(`No task w/ id: ${taskID}`)
      return {
        dialogData: {
          type: "edit-task",
          inputName: task.title,
          taskID,
        },
      }
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
    const newTask = $task(name, 0, parentID);
    set((s) => {
      return { tasks: [...s.tasks, newTask] };
    });
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
  incrementOneSecToActiveTask() {
    set((s) => {
      const newTasks = [...s.tasks];
      for (const task of newTasks) {
        if (task.id === s.activeTaskID) {
          task.secs += 1
          break;
        }
      }
      return { tasks: newTasks };
    });
  },
  resetDuration(taskID) {
    set((s) => {
      const newTasks = [...s.tasks];
      for (const task of newTasks) {
        if (task.id === taskID) {
          task.secs = 0
          break;
        }
      }
      return { tasks: newTasks };
    });
  },
  startTask(taskID) {
    const { activeTaskID, stopActiveTask } =
      get();
    if (activeTaskID === taskID) return;
    stopActiveTask();
    set(s => ({
      activeTaskID: taskID,
      timeInterval: setInterval(s.incrementOneSecToActiveTask, 1000),
    }));
  },
  finishTask(taskID) {
    const { activeTaskID, stopActiveTask, tasks } = get()
    if (activeTaskID && taskID === this.activeTaskID) stopActiveTask();
    const i = tasks.findIndex(task => task.id === taskID)
    if (i === -1) throw new Error("wtf this item doesn't exist dickhead");
    return set({ tasks: tasks.toSpliced(i, 1) })
  },
  toggleTaskOpen(taskID) {
    set((s) => {
      const newTasks = [...s.tasks];
      for (const task of newTasks) {
        if (task.id === taskID) {
          task.open = !task.open
          break;
        }
      }
      return { tasks: newTasks };
    });
  },
  getTask(taskID) {
    return get().tasks.find(t => t.id === taskID)
  }
}))

export type TaskStore = ReturnType<typeof createTaskStore>;
export const TaskContext = createContext<TaskStore | null>(null);

export function useTaskContext<T>(selector: (state: TaskStoreData) => T): T {
  const store = useContext(TaskContext);
  if (!store) throw new Error("Missing TaskContext.Provider in the tree");
  return useStore(store, selector);
}

// const [a,b,c] = useMultiTaskContext([s => s.a, s => s.b, s => s.c])
export function useMultiTaskContext<T extends any[]>(selectors: ((state: TaskStoreData) => T)[]) {
  const store = useContext(TaskContext);
  if (!store) throw new Error("Missing TaskContext.Provider in the tree");
  return selectors.map(selector => useStore(store, selector));
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
      : `${formatSecs(activeTask.secs)} → ${activeTask.title}`;
  }, [activeTaskID, activeTask?.secs, activeTask?.title]);
}
