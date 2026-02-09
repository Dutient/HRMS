export function LoadingSpinner() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-6">
      {/* Multi-layered Spinner */}
      <div className="relative">
        {/* Outer Ring */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        
        {/* Middle Ring */}
        <div className="absolute inset-0 m-auto h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        
        {/* Inner Pulse */}
        <div className="absolute inset-0 m-auto h-8 w-8 animate-pulse rounded-full bg-accent/30" />
        
        {/* Center Dot */}
        <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-gradient-to-br from-accent to-primary shadow-lg" />
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-heading text-lg font-semibold text-primary animate-pulse">
          Loading...
        </p>
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
