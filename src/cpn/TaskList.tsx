import { AnimatePresence } from "motion/react";
import type { TaskData } from "../lib";
import { Task } from "./Task";
export function TaskList({ tasks }: { tasks: TaskData[] }) {
  return (
    <div className={`size-full flex flex-col gap-1 p-1`}>
      <AnimatePresence>
        {tasks.map((task) => (
          <Task key={task.id} {...{ task }} />
        ))}
      </AnimatePresence>
    </div>
  );
}
