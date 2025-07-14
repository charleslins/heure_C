import { User } from "@/types";

export class Employee {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  canton_id?: number;
  municipality_id?: number;
  employee_id?: string;
  hire_date: string;
  position?: string;
  work_schedule?: any;

  constructor(data: Partial<Employee>) {
    this.id = data.id || "";
    this.name = data.name || "";
    this.email = data.email || "";
    this.role = data.role || "user";
    this.canton_id = data.canton_id;
    this.municipality_id = data.municipality_id;
    this.employee_id = data.employee_id;
    this.hire_date = data.hire_date || new Date().toISOString().split("T")[0];
    this.position = data.position;
    this.work_schedule = data.work_schedule;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      canton_id: this.canton_id,
      municipality_id: this.municipality_id,
      employee_id: this.employee_id,
      hire_date: this.hire_date,
      position: this.position,
      work_schedule: this.work_schedule,
    };
  }

  static fromUser(user: User): Employee {
    return new Employee({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  getFullName(): string {
    return this.name;
  }

  getFormattedHireDate(locale: string = "pt-BR"): string {
    return new Date(this.hire_date).toLocaleDateString(locale);
  }
}
