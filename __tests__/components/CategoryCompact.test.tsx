import { render, screen, fireEvent } from '@testing-library/react'
import { useDroppable } from '@dnd-kit/core'
import CategoryCompact from '@/components/CategoryCompact'
import { mockCategory } from '../fixtures'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn().mockReturnValue({ setNodeRef: jest.fn(), isOver: false }),
}))

const defaultProps = {
  category: mockCategory,
  spent: 0,
  onClick: jest.fn(),
  isSelected: false,
  isFiltering: false,
}

describe('CategoryCompact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDroppable as jest.Mock).mockReturnValue({ setNodeRef: jest.fn(), isOver: false })
  })

  it('renders the category name', () => {
    render(<CategoryCompact {...defaultProps} />)
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
  })

  it('renders the spent and max budget amounts formatted as EUR currency', () => {
    render(<CategoryCompact {...defaultProps} spent={120} />)
    expect(screen.getByText(/120/)).toBeInTheDocument()
    expect(screen.getByText(/300/)).toBeInTheDocument()
  })

  it('shows "Bijna op" badge when spending is between 80% and 99%', () => {
    render(<CategoryCompact {...defaultProps} spent={250} />)
    expect(screen.getByText('Bijna op')).toBeInTheDocument()
  })

  it('shows "Over budget" badge when spending is 100% or more', () => {
    render(<CategoryCompact {...defaultProps} spent={350} />)
    expect(screen.getByText('Over budget')).toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', () => {
    const onClick = jest.fn()
    const { container } = render(<CategoryCompact {...defaultProps} onClick={onClick} />)
    fireEvent.click(container.firstChild as HTMLElement)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies hover ring styles when a draggable is over the card', () => {
    ;(useDroppable as jest.Mock).mockReturnValueOnce({ setNodeRef: jest.fn(), isOver: true })
    const { container } = render(<CategoryCompact {...defaultProps} />)
    expect(container.firstChild).toHaveClass('ring-2', 'ring-indigo-400', 'bg-indigo-50')
  })
})
