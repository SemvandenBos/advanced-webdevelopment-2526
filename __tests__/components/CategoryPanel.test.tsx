import { render, screen, fireEvent } from '@testing-library/react'
import { useDroppable } from '@dnd-kit/core'
import CategoryPanel from '@/components/CategoryPanel'
import { mockCategory, mockCategory2 } from '../fixtures'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn().mockReturnValue({ setNodeRef: jest.fn(), isOver: false }),
}))

const defaultProps = {
  spending: new Map<string, number>(),
  selectedCategoryId: null,
  bookId: 'book-1',
  isOwner: true,
  onSelect: jest.fn(),
}

describe('CategoryPanel', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('empty state', () => {
    it('renders an empty-state message when categories is an empty array', () => {
      render(<CategoryPanel {...defaultProps} categories={[]} />)
      expect(screen.getByText(/geen categorieën/i)).toBeInTheDocument()
    })

    it('renders a "Voeg er een toe" link pointing to the correct categories URL when empty', () => {
      render(<CategoryPanel {...defaultProps} categories={[]} />)
      const link = screen.getByRole('link', { name: /voeg er een toe/i })
      expect(link).toHaveAttribute('href', '/books/book-1/categories')
    })
  })

  describe('category list', () => {
    it('renders one CategoryCompact per category in the list', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory, mockCategory2]}
        />
      )
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
    })

    it('passes the correct spent amount from the spending map to each CategoryCompact', () => {
      const spending = new Map([['cat-1', 150]])
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory]}
          spending={spending}
        />
      )
      // 150 out of 300 budget should appear
      expect(screen.getByText(/150/)).toBeInTheDocument()
    })

  })

  describe('selection state', () => {
    it('passes isSelected=true only to the category matching selectedCategoryId', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory, mockCategory2]}
          selectedCategoryId="cat-1"
        />
      )
      // cat-1 is selected: its card should have ring styling
      const boodschappenCard = screen.getByText('Boodschappen').closest('.rounded-lg')
      expect(boodschappenCard).toHaveClass('ring-2', 'ring-indigo-400')
    })

    it('passes isFiltering=true: non-selected categories fade when a filter is active', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory, mockCategory2]}
          selectedCategoryId="cat-1"
        />
      )
      // Transport (cat-2) is not selected → should be faded
      const transportCard = screen.getByText('Transport').closest('.rounded-lg')
      expect(transportCard).toHaveClass('opacity-40', 'grayscale')
    })

    it('calls onSelect with the clicked category id', () => {
      const onSelect = jest.fn()
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory]}
          onSelect={onSelect}
        />
      )
      fireEvent.click(screen.getByText('Boodschappen').closest('.rounded-lg')!)
      expect(onSelect).toHaveBeenCalledWith('cat-1')
    })
  })

  describe('ownership', () => {
    it('forwards isOwner=true to each CategoryCompact, enabling its drop target', () => {
      render(<CategoryPanel {...defaultProps} categories={[mockCategory]} isOwner={true} />)
      expect(useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false })
      )
    })

    it('forwards isOwner=false to each CategoryCompact, disabling its drop target', () => {
      render(<CategoryPanel {...defaultProps} categories={[mockCategory]} isOwner={false} />)
      expect(useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: true })
      )
    })
  })
})
