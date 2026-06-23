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
  isOwner: true,
}

describe('CategoryCompact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDroppable as jest.Mock).mockReturnValue({ setNodeRef: jest.fn(), isOver: false })
  })

  describe('rendering', () => {
    it('renders the category name', () => {
      render(<CategoryCompact {...defaultProps} />)
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    })

    it('renders the spent and max budget amounts formatted as EUR currency', () => {
      render(<CategoryCompact {...defaultProps} spent={120} />)
      expect(screen.getByText(/120/)).toBeInTheDocument()
      expect(screen.getByText(/300/)).toBeInTheDocument()
    })
  })

  describe('progress bar colour', () => {
    it('renders a green bar when spending is below 80%', () => {
      const { container } = render(<CategoryCompact {...defaultProps} spent={100} />)
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
    })

    it('renders a yellow bar when spending is between 80% and 99%', () => {
      const { container } = render(<CategoryCompact {...defaultProps} spent={250} />) // 83%
      expect(container.querySelector('.bg-yellow-400')).toBeInTheDocument()
    })

    it('renders a red bar when spending is 100% or more', () => {
      const { container } = render(<CategoryCompact {...defaultProps} spent={300} />) // 100%
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
    })
  })

  describe('budget badge', () => {
    it('shows "Bijna op" badge when spending is between 80% and 99%', () => {
      render(<CategoryCompact {...defaultProps} spent={250} />)
      expect(screen.getByText('Bijna op')).toBeInTheDocument()
    })

    it('shows "Over budget" badge when spending is 100% or more', () => {
      render(<CategoryCompact {...defaultProps} spent={350} />)
      expect(screen.getByText('Over budget')).toBeInTheDocument()
    })

    it('shows no badge when spending is below 80%', () => {
      render(<CategoryCompact {...defaultProps} spent={50} />)
      expect(screen.queryByText('Over budget')).not.toBeInTheDocument()
      expect(screen.queryByText('Bijna op')).not.toBeInTheDocument()
    })
  })

  describe('selection state', () => {
    it('applies selected ring styles when isSelected is true', () => {
      const { container } = render(<CategoryCompact {...defaultProps} isSelected={true} />)
      expect(container.firstChild).toHaveClass('ring-2', 'ring-indigo-400')
    })

    it('does not apply selected ring styles when isSelected is false', () => {
      const { container } = render(<CategoryCompact {...defaultProps} isSelected={false} />)
      expect(container.firstChild).not.toHaveClass('ring-2')
    })

    it('applies faded/grayscale styles when isFiltering is true and isSelected is false', () => {
      const { container } = render(
        <CategoryCompact {...defaultProps} isFiltering={true} isSelected={false} />
      )
      expect(container.firstChild).toHaveClass('opacity-40', 'grayscale')
    })

    it('does not apply faded styles when isFiltering is false', () => {
      const { container } = render(
        <CategoryCompact {...defaultProps} isFiltering={false} isSelected={false} />
      )
      expect(container.firstChild).not.toHaveClass('opacity-40')
    })
  })

  describe('interaction', () => {
    it('calls onClick when the card is clicked', () => {
      const onClick = jest.fn()
      const { container } = render(<CategoryCompact {...defaultProps} onClick={onClick} />)
      fireEvent.click(container.firstChild as HTMLElement)
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('drag-and-drop', () => {
    it('applies hover ring styles when a draggable is over the card', () => {
      ;(useDroppable as jest.Mock).mockReturnValueOnce({ setNodeRef: jest.fn(), isOver: true })
      const { container } = render(<CategoryCompact {...defaultProps} />)
      expect(container.firstChild).toHaveClass('ring-2', 'ring-indigo-400', 'bg-indigo-50')
    })

    it('passes disabled: false to useDroppable for the owner', () => {
      render(<CategoryCompact {...defaultProps} />)
      expect(useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false })
      )
    })

    it('passes disabled: true to useDroppable for non-owners', () => {
      render(<CategoryCompact {...defaultProps} isOwner={false} />)
      expect(useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true })
      )
    })
  })
})
