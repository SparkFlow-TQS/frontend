import * as React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card', () => {
  it('renders card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('applies custom className to card', () => {
    render(<Card className="custom-card">Content</Card>)
    const card = screen.getByText('Content').closest('[data-slot="card"]')
    expect(card).toHaveClass('custom-card')
  })

  it('renders card header with custom className', () => {
    render(
      <CardHeader className="custom-header">
        <CardTitle>Title</CardTitle>
      </CardHeader>
    )
    const header = screen.getByText('Title').closest('[data-slot="card-header"]')
    expect(header).toHaveClass('custom-header')
  })

  it('renders card content with custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content).toHaveClass('custom-content')
  })

  it('renders card footer with custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('custom-footer')
  })
}) 