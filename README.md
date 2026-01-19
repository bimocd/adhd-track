# TODO

- Dnd-Kit
  - set task as child of another task
  - re-order tasks
  - drag task to trash (delete) lol
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
- History
- Undo