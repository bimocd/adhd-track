import { icons } from "lucide-react";
import type { PropsWithChildren } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shadcn/ui/context-menu";

export type RightClickMenuItem =
  | "-" // Separator
  | {
    iconName: keyof typeof icons;
    title: string;
    danger?: boolean;
    onClick?: () => void;
  };
export function RightClickMenu({
  children,
  menu,
}: PropsWithChildren & {
  menu: ReadonlyArray<RightClickMenuItem>;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {menu.map((menu, i) => {
          if (menu === "-")
            return <ContextMenuSeparator key={`sep-${i}`} />;
          const Icon = icons[menu.iconName];
          return <ContextMenuItem
            key={menu.iconName}
            onClick={menu.onClick}
            className={`${menu.onClick ? "hover:cursor-pointer" : "opacity-50"}
            ${menu.danger && "hover:text-red-500!"}
            group **:duration-75 `}
          >
            <Icon
              className={`stroke-2.5 ${menu.danger && "group-hover:stroke-red-500"}`}
            />
            {menu.title}
          </ContextMenuItem>
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}