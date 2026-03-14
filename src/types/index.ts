import { z } from "zod";

// ---- Zod Schemas ----
export const IdpFormSchema = z
  .object({
    year: z.number().int(),
    quarterStart: z.number().int().min(1).max(4),
    quarterEnd: z.number().int().min(1).max(4),
    skillGoal: z.string().min(10),
    actionPlan: z.string().min(10),
    budget: z.number().int().min(0).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  })
  .refine((d) => d.quarterEnd >= d.quarterStart, {
    message: "Quarter End must be ≥ Quarter Start",
    path: ["quarterEnd"],
  });

export type IdpFormInput = z.infer<typeof IdpFormSchema>;

// ---- Server Action Result ----
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type BannerState =
  | "OVERDUE"
  | "MISSING_CURRENT"
  | "TODO_CURRENT"
  | "NONE";

export type BannerStateWithDetails = {
  state: BannerState;
  overdueYear?: number;
  overdueQuarterEnd?: number;
};

// ---- Dashboard ----
export type DashboardStats = {
  totalEmployees: number;
  submittedCount: number;
  pendingCount: number;
  approvedCount: number;
  completionRate: number;
  totalBudgetRequested: number;
  quarter: number;
  year: number;
};

export type SubmissionRow = {
  id: string;
  userName: string;
  companyName: string;
  quarterStart: number;
  quarterEnd: number;
  year: number;
  skillGoal: string;
  budget: number | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  approvedAt: Date | null;
  createdAt: Date;
};

// ---- Admin (HR_GROUP) ----
export const CreateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  parentId: z.string().min(1, "Parent company is required"),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["EMPLOYEE", "HR_COMPANY", "HR_GROUP"]),
  companyId: z.string().min(1, "Company is required"),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
