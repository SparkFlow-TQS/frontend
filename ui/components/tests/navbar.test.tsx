import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '../navbar'

describe('Navbar Component', () => {
  it('renders navbar with logo and links', () => {
    render(<Navbar />)
    expect(screen.getByText('SparkFlow')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('renders links with correct hrefs', () => {
    render(<Navbar />)
    expect(screen.getByText('Schedule').closest('a')).toHaveAttribute('href', '/schedule')
    expect(screen.getByText('Map').closest('a')).toHaveAttribute('href', '/map')
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Sign Out').closest('a')).toHaveAttribute('href', '/signout')
  })
}) 