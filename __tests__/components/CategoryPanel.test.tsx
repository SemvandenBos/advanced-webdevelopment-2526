import { render, screen, fireEvent } from '@testing-library/react'
import CategoryPanel from '@/components/CategoryPanel'
import { mockCategory, mockCategory2 } from '../fixtures'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn().mockReturnValue({ setNodeRef: jest.fn(), isOver: false }),
}))

const defaultProps = {
  spending: new Map<string, number>(),
  selectedCategoryId: null,
  bookId: 'book-1',
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

    it('passes spent=0 for a category not present in the spending map', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory]}
          spending={new Map()}
        />
      )
      // 0 / 300 budget — the component renders "€ 0,00 / € 300,00"
      expect(screen.getByText(/0,00/)).toBeInTheDocument()
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

    it('passes isSelected=false to all categories when selectedCategoryId is null', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory]}
          selectedCategoryId={null}
        />
      )
      const card = screen.getByText('Boodschappen').closest('.rounded-lg')
      expect(card).not.toHaveClass('ring-2')
    })

    it('passes isFiltering=true — non-selected categories fade when a filter is active', () => {
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

    it('passes isFiltering=false — no category is faded when selectedCategoryId is null', () => {
      render(
        <CategoryPanel
          {...defaultProps}
          categories={[mockCategory]}
          selectedCategoryId={null}
        />
      )
      const card = screen.getByText('Boodschappen').closest('.rounded-lg')
      expect(card).not.toHaveClass('opacity-40')
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
})
