import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-md outline-none transition-[color,background-color,border-color] duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        outline:
          'h-9 px-4 py-2 text-sm border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        link:
          'h-9 px-4 py-2 text-sm text-primary underline-offset-4 hover:underline',
        glass:
          'h-[36px] md:h-[42px] px-3 md:px-4 text-[12px] md:text-[15px] tracking-tighter border backdrop-blur-sm hover:bg-white/30',
        soft:
          'gap-1 px-2 py-0.5 text-[13px] border border-foreground/20 text-foreground/40 hover:border-foreground/40 hover:bg-white/30',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
