import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Toggle } from './Toggle.vue'

export const toggleVariants = cva(
  'group/toggle inline-flex items-center justify-center gap-1 text-sm font-bold whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-card hover:bg-muted',
        outline: 'border-2 border-input bg-card hover:bg-muted',
      },
      size: {
        default: 'h-11 min-w-11 px-3.5',
        sm: 'h-9 min-w-9 px-2.5 text-xs',
        lg: 'h-12 min-w-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ToggleVariants = VariantProps<typeof toggleVariants>
