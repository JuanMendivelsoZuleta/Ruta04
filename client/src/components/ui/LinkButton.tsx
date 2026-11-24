import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LinkProps } from 'react-router'
import { buttonClasses } from './button-styles'
import type { ButtonSize, ButtonVariant } from './button-styles'

export type LinkButtonProps = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  children: ReactNode
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {leftIcon}
      {children}
    </Link>
  )
}
