import {
  ColumnType,
  Generated,
  Selectable,
} from 'kysely'

export interface Database {
  users: UserTable
  user_branches: UserBranchTable
  roles: RoleTable
  departments: DepartmentTable
  branches: BranchTable
  tasks: TaskTable
  task_assignments: TaskAssignmentTable
  task_sessions: TaskSessionTable
  task_session_attachments: TaskSessionAttachmentTable
  task_groups: TaskGroupTable
}

export interface UserTable {
  id: Generated<number>
  username: string
  password_hash: string
  full_name: string
  email: string
  department_id: number | null
  role_id: number | null
  branch_id: number | null
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface UserBranchTable {
  id: Generated<number>
  user_id: number
  branch_id: number
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface TaskTable {
  id: Generated<number>
  title: string
  description: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  subtype: 'pre-opening' | 'pre-closing' | null
  position_id: number | null
  created_at: Generated<Date>
  group_id: number
  weight: number
  sort_order: number
  updated_at: Date
  deleted_at: Date | null
}

export interface TaskAssignmentTable {
  id: Generated<number>
  task_id: number
  user_id: number
  assigned_at: Generated<Date>
  assigned_by: number
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface TaskSessionTable {
  id: Generated<number>
  session_date: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  task_id: number
  user_id: number
  branch_id: number | null
  score: number | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED'
  started_at: Date | null
  completed_at: Date | null
  approved_by: number | null
  approved_at: Date | null
  manager_comment: string | null
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface TaskSessionAttachmentTable {
  id: Generated<number>
  task_session_id: number
  file_url: string
  created_at: Generated<Date>
}

export interface RoleTable {
  id: Generated<number>
  code: string
  name: string
  description: string
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface DepartmentTable {
  id: Generated<number>
  name: string
  description: string
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface BranchTable {
  id: Generated<number>
  name: string
  location: string
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export interface TaskGroupTable {
  id: Generated<number>
  name: string
  percent_weight: number
  created_at: Generated<Date>
  updated_at: Date
  deleted_at: Date | null
}

export type User = Selectable<UserTable>
export type UserBranch = Selectable<UserBranchTable>
export type Role = Selectable<RoleTable>
export type Task = Selectable<TaskTable>
export type TaskSession = Selectable<TaskSessionTable>
export type Department = Selectable<DepartmentTable>
export type Branch = Selectable<BranchTable>
export type TaskAssignment = Selectable<TaskAssignmentTable>
export type TaskSessionAttachment = Selectable<TaskSessionAttachmentTable>
export type TaskGroup = Selectable<TaskGroupTable>