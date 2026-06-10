import { render, screen } from '@testing-library/react'
import TransactionDragPreview from '@/components/TransactionDragPreview'
import { mockTransaction, mockIncomeTransaction } from '../fixtures'

// RTL normalizes element text (  → space) but does NOT normalize the query string.
// Replace U+00A0 so queries match the RTL-normalized element text.
const fmt = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })
    .format(n)
    .replace(/ /g, " ")

describe('TransactionDragPreview', () => {
  describe('expense transaction', () => {
    it('renders a red colour indicator for expense type', () => {
      const { container } = render(<TransactionDragPreview transaction={mockTransaction} />)
      expect(container.querySelector('.bg-red-400')).toBeInTheDocument()
    })

    it('renders the amount with a minus sign', () => {
      render(<TransactionDragPreview transaction={mockTransaction} />)
      expect(screen.getByText(`-${fmt(mockTransaction.amount)}`)).toBeInTheDocument()
    })

    it('renders the description text when present', () => {
      render(<TransactionDragPreview transaction={mockTransaction} />)
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    })

    it('renders "Uitgave" as fallback when description is empty', () => {
      render(<TransactionDragPreview transaction={{ ...mockTransaction, description: '' }} />)
      expect(screen.getByText('Uitgave')).toBeInTheDocument()
    })

    it('formats the amount as EUR currency in nl-NL locale', () => {
      render(<TransactionDragPreview transaction={{ ...mockTransaction, amount: 1234.56 }} />)
      expect(screen.getByText(`-${fmt(1234.56)}`)).toBeInTheDocument()
    })
  })

  describe('income transaction', () => {
    it('renders a green colour indicator for income type', () => {
      const { container } = render(<TransactionDragPreview transaction={mockIncomeTransaction} />)
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
    })

    it('renders the amount with a plus sign', () => {
      render(<TransactionDragPreview transaction={mockIncomeTransaction} />)
      expect(screen.getByText(`+${fmt(mockIncomeTransaction.amount)}`)).toBeInTheDocument()
    })

    it('renders "Inkomsten" as fallback when description is empty', () => {
      render(<TransactionDragPreview transaction={{ ...mockIncomeTransaction, description: '' }} />)
      expect(screen.getByText('Inkomsten')).toBeInTheDocument()
    })
  })
})
