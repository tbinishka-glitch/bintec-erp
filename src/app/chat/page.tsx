export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">💬</span>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Your Messages</h2>
      <p className="text-muted-foreground max-w-sm">
        Select a conversation from the sidebar or start a new direct message to collaborate with your team.
      </p>
    </div>
  )
}
