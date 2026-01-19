import { Task } from "./Task";

export function TaskList({ taskIDs }: { taskIDs: string[] }) {
  return (
    <div className={`size-full flex flex-col gap-1 p-1`}>
      {taskIDs.map((taskID) => (
        <Task key={taskID} {...{ taskID }} />
      ))}
    </div>
  );
}
