import { render, screen } from '@testing-library/react'
import { Calendar } from '../calendar'

describe('Calendar Component', () => {
  it('renders calendar with current month', () => {
    render(<Calendar />)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    expect(screen.getByText(currentMonth)).toBeInTheDocument()
  })

  it('renders calendar with selected date', () => {
    const selectedDate = new Date('2024-03-15')
    render(<Calendar selected={selectedDate} />)
    expect(screen.getByText('15')).toHaveClass('bg-primary')
  })
}) 