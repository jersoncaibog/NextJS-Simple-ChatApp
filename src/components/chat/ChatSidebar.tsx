"use client";

import { UserMenu } from "@/components/user/UserMenu";

export function ChatSidebar() {
  return (
    <>
      <div className="p-4 flex flex-row items-center gap-2">
        <UserMenu />
        <h1 className=" select-none font-bold text-zinc-700">Chats</h1>
      </div>
      <div className="px-2">
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">John Doe</div>
              <div className="text-xs text-gray-500">
                Last message: 2 hours ago
              </div>
            </div>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-500">
              AS
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Alice Smith</div>
              <div className="text-xs text-gray-500">
                Last message: Yesterday
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
