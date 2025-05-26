import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders button with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders button with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-secondary')
  })

  it('renders button with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button', { name: /outline/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border')
  })

  it('renders button with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('renders button with link variant', () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole('button', { name: /link/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('underline-offset-4')
  })

  it('renders button with different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass('size-9')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })
}) 