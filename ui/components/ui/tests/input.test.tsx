import { render, screen } from '@testing-library/react'
import { Input } from '../input'

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders input with value', () => {
    render(<Input value="Test value" readOnly />)
    expect(screen.getByDisplayValue('Test value')).toBeInTheDocument()
  })

  it('renders disabled input', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
}) 