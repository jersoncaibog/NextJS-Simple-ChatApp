'use client'

import { Icon } from '@/components/ui/Icon'

export function ChatSidebar() {
  return (
    <>
      <div className="p-4">
        <button className="flex w-full items-center justify-between rounded-lg bg-white p-2 shadow-sm hover:bg-gray-50">
          <span className="text-sm font-medium text-gray-700">New Chat</span>
          <Icon name="new-chat" className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="px-2">
        <h2 className="mb-2 px-3 text-xs font-semibold text-gray-500">Recent Conversations</h2>
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">John Doe</div>
              <div className="text-xs text-gray-500">Last message: 2 hours ago</div>
            </div>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-500">
              AS
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Alice Smith</div>
              <div className="text-xs text-gray-500">Last message: Yesterday</div>
            </div>
          </button>
        </div>
      </div>
    </>
  )
} 