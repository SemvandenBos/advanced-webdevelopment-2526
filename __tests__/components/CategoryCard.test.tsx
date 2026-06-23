import { render, screen, fireEvent } from '@testing-library/react'
import CategoryCard from '@/components/CategoryCard'
import { mockCategory } from '../fixtures'

const defaultProps = {
  category: mockCategory,
  bookId: 'book-1',
  onDelete: jest.fn(),
  isOwner: true,
}

describe('CategoryCard', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('rendering', () => {
    it('renders the category name', () => {
      render(<CategoryCard {...defaultProps} spent={0} />)
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    })

    it('renders the spent amount formatted as EUR currency', () => {
      render(<CategoryCard {...defaultProps} spent={120} />)
      expect(screen.getByText(/120/)).toBeInTheDocument()
    })

    it('renders the maxBudget formatted as EUR currency', () => {
      render(<CategoryCard {...defaultProps} spent={0} />)
      expect(screen.getByText(/300/)).toBeInTheDocument()
    })

    it('renders the end date in Dutch locale when endDate is set', () => {
      const categoryWithEnd = {
        ...mockCategory,
        endDate: { toDate: () => new Date('2025-12-31') } as ReturnType<typeof mockCategory.createdAt.toDate> as unknown as typeof mockCategory.createdAt,
      }
      render(<CategoryCard {...defaultProps} category={categoryWithEnd} spent={0} />)
      expect(screen.getByText(/31 december 2025/i)).toBeInTheDocument()
    })

    it('does not render an end date when endDate is absent', () => {
      render(<CategoryCard {...defaultProps} spent={0} />)
      expect(screen.queryByText(/t\/m/)).not.toBeInTheDocument()
    })
  })

  describe('progress bar colour', () => {
    it('renders a green progress bar when spending is below 80% of budget', () => {
      const { container } = render(<CategoryCard {...defaultProps} spent={100} />)
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
    })

    it('renders a yellow progress bar when spending is between 80% and 99% of budget', () => {
      const { container } = render(<CategoryCard {...defaultProps} spent={250} />) // 83% of 300
      expect(container.querySelector('.bg-yellow-400')).toBeInTheDocument()
    })

    it('renders a red progress bar when spending equals or exceeds 100% of budget', () => {
      const { container } = render(<CategoryCard {...defaultProps} spent={300} />) // 100%
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
    })
  })

  describe('budget warnings', () => {
    it('shows "Let op: bijna op" warning when spending is between 80% and 99%', () => {
      render(<CategoryCard {...defaultProps} spent={250} />) // 83%
      expect(screen.getByText(/bijna op/i)).toBeInTheDocument()
    })

    it('shows "Over budget" warning when spending is 100% or more', () => {
      render(<CategoryCard {...defaultProps} spent={350} />) // 117%
      expect(screen.getByText(/over budget/i)).toBeInTheDocument()
    })

    it('shows no warning when spending is below 80%', () => {
      render(<CategoryCard {...defaultProps} spent={50} />)
      expect(screen.queryByText(/over budget/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/bijna op/i)).not.toBeInTheDocument()
    })
  })

  describe('owner actions', () => {
    it('renders "Bewerken" link pointing to the correct edit URL for the owner', () => {
      render(<CategoryCard {...defaultProps} spent={0} />)
      const link = screen.getByRole('link', { name: /bewerken/i })
      expect(link).toHaveAttribute('href', '/books/book-1/categories/cat-1/edit')
    })

    it('renders "Verwijderen" button for the owner', () => {
      render(<CategoryCard {...defaultProps} spent={0} />)
      expect(screen.getByRole('button', { name: /verwijderen/i })).toBeInTheDocument()
    })

    it('calls onDelete with the category id when "Verwijderen" is clicked', () => {
      const onDelete = jest.fn()
      render(<CategoryCard {...defaultProps} onDelete={onDelete} spent={0} />)
      fireEvent.click(screen.getByRole('button', { name: /verwijderen/i }))
      expect(onDelete).toHaveBeenCalledWith('cat-1')
    })

    it('does not render edit or delete controls for non-owners', () => {
      render(<CategoryCard {...defaultProps} isOwner={false} spent={0} />)
      expect(screen.queryByRole('link', { name: /bewerken/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /verwijderen/i })).not.toBeInTheDocument()
    })
  })
})
