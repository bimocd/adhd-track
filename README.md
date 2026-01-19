# TODO

- Add Dnd-kit (drag and drop) for tasks (it's gonna be hard because tasks are nested + I need visual indicators for where the task will end up + smooth motion transitions)
- Fix way of storing tasks on zustand & localstorage from tree to tables, from
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
- Fix [`Dialog`](./src/cpn/Dialog.tsx) exit animation