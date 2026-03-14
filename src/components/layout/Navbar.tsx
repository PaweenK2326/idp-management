import Link from "next/link";
import { getSession } from "@/lib/session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getRoleVariant(
  role: string
): "default" | "secondary" | "destructive" | "outline" {
  if (role === "EMPLOYEE") return "default";
  if (role === "HR_COMPANY") return "secondary";
  return "destructive";
}

function getRoleLabel(role: string): string {
  if (role === "EMPLOYEE") return "Employee";
  if (role === "HR_COMPANY") return "HR (Company)";
  return "HR (Group)";
}

export async function Navbar() {
  const session = await getSession();
  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e4e0] bg-white">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href={session.role === "EMPLOYEE" ? "/idp/summary" : "/dashboard"} className="cursor-pointer font-semibold">
            IDP System
          </Link>
          {session.role === "EMPLOYEE" && (
            <>
              <Link href="/idp" className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]">
                New IDP
              </Link>
              <Link href="/idp/summary" className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]">
                Summary
              </Link>
            </>
          )}
          {session.role === "HR_GROUP" && (
            <>
              <Link href="/dashboard/companies" className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]">
                Companies
              </Link>
              <Link href="/dashboard/users" className="cursor-pointer text-sm text-[#5c5a57] hover:text-[#2d4a6a]">
                Users
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{session.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session.name}</span>
            <Badge variant={getRoleVariant(session.role)}>
              {getRoleLabel(session.role)}
            </Badge>
          </div>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
