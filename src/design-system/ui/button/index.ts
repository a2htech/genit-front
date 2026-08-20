import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border-2 border-border transition-all duration-100 outline-none select-none disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-success text-success-foreground',
        outline: 'bg-background text-foreground hover:bg-muted',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
        link: 'h-auto! border-transparent bg-transparent p-0! text-primary underline-offset-4 hover:underline',
      },
      emphasis: {
        cta: 'font-heading text-sm font-extrabold tracking-wide uppercase shadow-brutal-md hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm',
        compact: 'text-sm font-semibold',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3 text-xs',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      emphasis: 'cta',
      size: 'default',
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
