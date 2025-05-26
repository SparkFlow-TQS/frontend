import { render, screen } from '@testing-library/react'
import { Slider } from '../slider'

describe('Slider Component', () => {
  it('renders slider with default value', () => {
    render(<Slider defaultValue={[50]} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  it('renders disabled slider', () => {
    render(<Slider disabled />)
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  it('renders slider with min and max values', () => {
    render(<Slider min={0} max={100} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
  })
}) 