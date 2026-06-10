import { render, screen, fireEvent } from '@testing-library/react'
import { useDraggable } from '@dnd-kit/core'
import TransactionRow from '@/components/TransactionRow'
import { mockTransaction, mockIncomeTransaction } from '../fixtures'

jest.mock('@dnd-kit/core', () => ({
  useDraggable: jest.fn().mockReturnValue({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    isDragging: false,
  }),
}))

const defaultProps = {
  bookId: 'book-1',
  onDelete: jest.fn(),
  isOwner: true,
}

describe('TransactionRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDraggable as jest.Mock).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      isDragging: false,
    })
  })

  describe('expense transaction', () => {
    it('renders a red colour dot indicator', () => {
      const { container } = render(
        <TransactionRow {...defaultProps} transaction={mockTransaction} />
      )
      expect(container.querySelector('.bg-red-400')).toBeInTheDocument()
    })

    it('renders the amount with a minus sign', () => {
      const fmt = (n: number) =>
        new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n).replace(/ /g, " ")
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      expect(screen.getByText(`-${fmt(mockTransaction.amount)}`)).toBeInTheDocument()
    })

    it('renders the description text when present', () => {
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    })

    it('renders "Uitgave" as fallback description when description is empty', () => {
      render(
        <TransactionRow
          {...defaultProps}
          transaction={{ ...mockTransaction, description: '' }}
        />
      )
      expect(screen.getByText('Uitgave')).toBeInTheDocument()
    })

    it('renders the date formatted in Dutch short locale', () => {
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      // date is 2025-03-15, nl-NL short = "15 mrt"
      expect(screen.getByText(/15 mrt/i)).toBeInTheDocument()
    })

    it('formats the amount as EUR currency in nl-NL locale', () => {
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      expect(screen.getByText(/€/)).toBeInTheDocument()
    })
  })

  describe('income transaction', () => {
    it('renders a green colour dot indicator', () => {
      const { container } = render(
        <TransactionRow {...defaultProps} transaction={mockIncomeTransaction} />
      )
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
    })

    it('renders the amount with a plus sign', () => {
      const fmt = (n: number) =>
        new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n).replace(/ /g, " ")
      render(<TransactionRow {...defaultProps} transaction={mockIncomeTransaction} />)
      expect(screen.getByText(`+${fmt(mockIncomeTransaction.amount)}`)).toBeInTheDocument()
    })

    it('renders "Inkomsten" as fallback description when description is empty', () => {
      render(
        <TransactionRow
          {...defaultProps}
          transaction={{ ...mockIncomeTransaction, description: '' }}
        />
      )
      expect(screen.getByText('Inkomsten')).toBeInTheDocument()
    })
  })

  describe('owner actions', () => {
    it('renders the "Bewerken" link pointing to the correct edit URL for the owner', () => {
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      expect(screen.getByRole('link', { name: /bewerken/i })).toHaveAttribute(
        'href',
        '/books/book-1/transactions/tx-1/edit'
      )
    })

    it('renders the "Verwijderen" button for the owner', () => {
      render(<TransactionRow {...defaultProps} transaction={mockTransaction} />)
      expect(screen.getByRole('button', { name: /verwijderen/i })).toBeInTheDocument()
    })

    it('calls onDelete with the transaction id when "Verwijderen" is clicked', () => {
      const onDelete = jest.fn()
      render(
        <TransactionRow {...defaultProps} transaction={mockTransaction} onDelete={onDelete} />
      )
      fireEvent.click(screen.getByRole('button', { name: /verwijderen/i }))
      expect(onDelete).toHaveBeenCalledWith('tx-1')
    })

    it('does not render edit or delete controls for non-owners', () => {
      render(
        <TransactionRow {...defaultProps} transaction={mockTransaction} isOwner={false} />
      )
      expect(screen.queryByRole('link', { name: /bewerken/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /verwijderen/i })).not.toBeInTheDocument()
    })
  })

  describe('drag behaviour', () => {
    it('reduces opacity when isDragging is true', () => {
      ;(useDraggable as jest.Mock).mockReturnValueOnce({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        isDragging: true,
      })
      const { container } = render(
        <TransactionRow {...defaultProps} transaction={mockTransaction} />
      )
      expect(container.firstChild).toHaveClass('opacity-30')
    })

    it('renders at full opacity when not dragging', () => {
      const { container } = render(
        <TransactionRow {...defaultProps} transaction={mockTransaction} />
      )
      expect(container.firstChild).not.toHaveClass('opacity-30')
    })
  })
})
