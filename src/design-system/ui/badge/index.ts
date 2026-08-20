import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border-2 border-border px-2.5 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        accent: 'bg-accent text-accent-foreground',
        outline: 'bg-background text-foreground',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
