/** `PermissionEnum` côté back : un contrat d'API, jamais déduit du rôle. */
export type Permission =
  | 'dashboard.view-full'
  | 'academic-years.manage'
  | 'curriculum.view'
  | 'teaching-units.manage'
  | 'subjects.manage'
  | 'students.view'
  | 'students.manage'
  | 'transcripts.view'
  | 'results.view'
  | 'results.calculate'
  | 'scores.view-all'
  | 'scores.manage-own'
  | 'scores.manage-all'
  | 'scores.deliberate'
  | 'users.manage'

export type Role = 'admin' | 'coordinator' | 'teacher' | 'user'

export interface Me {
  clerk_id: string
  email: string | null
  /** Affichage seulement : les droits se testent sur `permissions`. */
  role: Role
  permissions: Permission[]
}
