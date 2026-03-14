"use client";

import { useMemo, useState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { User } from "@prisma/client";

interface MockLoginFormProps {
  users: (User & { company: { id: string; name: string } })[];
}

function getRoleVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
  if (role === "EMPLOYEE") return "default";
  if (role === "HR_COMPANY") return "secondary";
  return "destructive";
}

function getRoleLabel(role: string): string {
  if (role === "EMPLOYEE") return "Employee";
  if (role === "HR_COMPANY") return "HR (Company)";
  return "HR (Group)";
}

function getAvatarBg(role: string): string {
  if (role === "EMPLOYEE") return "bg-[#d4e8f5]";
  if (role === "HR_COMPANY") return "bg-[#e8e4d8]";
  return "bg-[#e8d8e8]";
}

const ROLE_ORDER: Record<string, number> = {
  HR_GROUP: 0,
  HR_COMPANY: 1,
  EMPLOYEE: 2,
};

export function MockLoginForm({ users }: MockLoginFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const usersByCompany = useMemo(() => {
    const map = new Map<string, (typeof users)[number][]>();
    for (const user of users) {
      const list = map.get(user.company.id) ?? [];
      list.push(user);
      map.set(user.company.id, list);
    }
    const entries = Array.from(map.entries()).map(([id, list]) => {
      const sorted = [...list].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
      return [id, sorted] as const;
    });
    return entries.sort((a, b) => {
      const hasHRGroup = (entry: typeof entries[0]) => entry[1].some((u) => u.role === "HR_GROUP");
      if (hasHRGroup(a) && !hasHRGroup(b)) return -1;
      if (!hasHRGroup(a) && hasHRGroup(b)) return 1;
      return a[1][0].company.name.localeCompare(b[1][0].company.name);
    });
  }, [users]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setIsPending(true);
    await loginAction(selectedId);
    setIsPending(false);
  }

  return (
    <Card className="w-full overflow-hidden border-[#e8e4e0] shadow-lg shadow-[#e8e4e0]/40">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f0f8] text-2xl">
          📋
        </div>
        <h1 className="text-xl font-bold text-[#5c5a57]">IDP Management</h1>
        <p className="text-sm text-[#9c9894]">Welcome back — select your account to continue</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {usersByCompany.map(([companyId, companyUsers]) => (
              <div key={companyId} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9894]">
                  {companyUsers[0].company.name}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {companyUsers.map((user) => {
              const isSelected = selectedId === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedId(user.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[#8ab4e0] bg-[#e8f0f8] shadow-md shadow-[#8ab4e0]/20 ring-2 ring-[#8ab4e0] ring-offset-2 ring-offset-white"
                      : "border-[#e8e4e0] bg-white hover:border-[#d4d0cc] hover:bg-[#faf8f6] hover:shadow-sm"
                  }`}
                >
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className={`text-base font-semibold text-[#5c5a57] ${getAvatarBg(user.role)}`}>
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#5c5a57]">{user.name}</p>
                    <p className="truncate text-xs text-[#9c9894]">{user.email}</p>
                    <div className="mt-1.5">
                      <Badge variant={getRoleVariant(user.role)} className="text-xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 text-[#8ab4e0]" aria-hidden>✓</span>
                  )}
                </button>
                  );
                })}
                </div>
              </div>
            ))}
          </div>
          <Button
            type="submit"
            disabled={!selectedId || isPending}
            className="h-12 w-full rounded-xl text-base font-medium transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <p className="text-center text-xs text-[#9c9894]">
          Demo mode — click an account above to sign in
        </p>
      </CardContent>
    </Card>
  );
}
