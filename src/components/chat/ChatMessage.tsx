interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp: string
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message}</p>
        <span className={`mt-1 block text-xs ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {timestamp}
        </span>
      </div>
    </div>
  )
} 