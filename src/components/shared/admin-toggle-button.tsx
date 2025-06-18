
"use client";

import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/role-context";
import { User, UserCog, ShieldQuestion } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminToggleButton() {
  const { role, toggleRole } = useRole();

  const isAdmin = role === 'admin';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRole}
            className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full bg-card text-card-foreground shadow-md hover:bg-card/90"
            aria-label={isAdmin ? "Switch to User Mode" : "Switch to Admin Mode"}
          >
            {isAdmin ? <UserCog className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <p>{isAdmin ? "Switch to User Mode" : "Switch to Admin Mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
