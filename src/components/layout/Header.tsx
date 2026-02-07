import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-primary text-white shadow-lg",
      className
    )}>
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="text-3xl font-extrabold tracking-tight font-heading">
          Duti<span className="text-accent">ent</span>
        </div>
        <nav>
          <ul className="flex gap-8">
            <li>
              <a 
                href="#" 
                className="font-medium transition-colors hover:text-accent"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="font-medium transition-colors hover:text-accent"
              >
                Candidates
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="font-medium transition-colors hover:text-accent"
              >
                Jobs
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="font-medium transition-colors hover:text-accent"
              >
                Reports
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
