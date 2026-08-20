import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Toggle } from './Toggle.vue'

export const toggleVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-1 text-sm font-bold transition-all [&_svg:not([class*=size-])]:size-4 group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-card hover:bg-muted',
        outline: 'border-input hover:bg-muted border-2 bg-card',
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
