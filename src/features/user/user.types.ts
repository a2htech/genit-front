import type { Permission, Role } from '@/features/auth'
import type { Subject } from '@/features/teaching-unit'

export interface User {
  clerk_id: string
  email: string | null
  role: Role
  permissions: Permission[]
  subjects: Subject[]
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  coordinator: 'Coordinateur',
  teacher: 'Enseignant',
  user: 'Sans rôle',
}

/** RoleEnum::teachers() côté back : les seuls rôles qui reçoivent des matières (sinon 422). */
export function canTeach(user: User): boolean {
  return user.role === 'teacher' || user.role === 'coordinator'
}
