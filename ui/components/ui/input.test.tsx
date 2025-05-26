import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('renders input with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders input with custom type', () => {
    render(<Input type="password" placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />)
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-input')
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled" />)
    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    
    await user.type(input, 'Hello')
    expect(input).toHaveValue('Hello')
  })

  it('handles controlled input', () => {
    const value = 'Controlled value'
    render(<Input value={value} readOnly placeholder="Controlled" />)
    expect(screen.getByPlaceholderText('Controlled')).toHaveValue(value)
  })
}) 