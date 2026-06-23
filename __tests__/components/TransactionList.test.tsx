import { render, screen } from '@testing-library/react'
import TransactionList from '@/components/TransactionList'
import { mockTransaction, mockIncomeTransaction, ts } from '../fixtures'
import { Transaction } from '@/types'

jest.mock('@dnd-kit/core', () => ({
  useDraggable: jest.fn().mockReturnValue({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    isDragging: false,
  }),
}))

const defaultProps = {
  loading: false,
  selectedCategoryId: null,
  bookId: 'book-1',
  isOwner: true,
  onDelete: jest.fn(),
  loadMoreRef: jest.fn(),
}

const makeTransaction = (id: string, date: Date, type: 'expense' | 'income' = 'expense'): Transaction => ({
  id,
  amount: 10,
  description: `Tx ${id}`,
  date: ts(date),
  type,
  categoryId: undefined,
  createdBy: 'user-1',
  createdAt: ts(date),
})

describe('TransactionList', () => {
  describe('loading state', () => {
    it('renders the TransactionListSkeleton when loading is true', () => {
      const { container } = render(
        <TransactionList {...defaultProps} transactions={[]} loading={true} />
      )
      // Skeleton renders animated pulse elements
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('does not render any transaction rows when loading', () => {
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction]}
          loading={true}
        />
      )
      expect(screen.queryByText('Boodschappen')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows "Geen transacties." when transactions is empty and no category filter is active', () => {
      render(
        <TransactionList {...defaultProps} transactions={[]} selectedCategoryId={null} />
      )
      expect(screen.getByText('Geen transacties.')).toBeInTheDocument()
    })

    it('shows "Geen transacties in deze categorie." when transactions is empty and a category filter is active', () => {
      render(
        <TransactionList {...defaultProps} transactions={[]} selectedCategoryId="cat-1" />
      )
      expect(screen.getByText('Geen transacties in deze categorie.')).toBeInTheDocument()
    })
  })

  describe('transaction rows', () => {
    it('renders one list item per transaction', () => {
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction, mockIncomeTransaction]}
        />
      )
      expect(screen.getByText('Boodschappen')).toBeInTheDocument()
      expect(screen.getByText('Salaris')).toBeInTheDocument()
    })

    it('passes the correct bookId to each TransactionRow', () => {
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction]}
          bookId="book-42"
        />
      )
      expect(screen.getByRole('link', { name: /bewerken/i })).toHaveAttribute(
        'href',
        '/books/book-42/transactions/tx-1/edit'
      )
    })

    it('passes isOwner correctly to each TransactionRow', () => {
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction]}
          isOwner={false}
        />
      )
      expect(screen.queryByRole('button', { name: /verwijderen/i })).not.toBeInTheDocument()
    })

    it('calls onDelete with the transaction id when a row triggers deletion', () => {
      const onDelete = jest.fn()
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction]}
          onDelete={onDelete}
        />
      )
      screen.getByRole('button', { name: /verwijderen/i }).click()
      expect(onDelete).toHaveBeenCalledWith('tx-1')
    })
  })

  describe('month headers', () => {
    it('renders a month header before the first transaction', () => {
      render(
        <TransactionList {...defaultProps} transactions={[mockTransaction]} />
      )
      // March 2025 in nl-NL: "maart 2025"
      expect(screen.getByText(/maart 2025/i)).toBeInTheDocument()
    })

    it('renders a new month header when adjacent transactions are in different months', () => {
      const txMarch = makeTransaction('tx-a', new Date('2025-03-10'))
      const txApril = makeTransaction('tx-b', new Date('2025-04-10'))
      render(
        <TransactionList {...defaultProps} transactions={[txMarch, txApril]} />
      )
      expect(screen.getByText(/maart 2025/i)).toBeInTheDocument()
      expect(screen.getByText(/april 2025/i)).toBeInTheDocument()
    })

    it('renders a new month header when adjacent transactions span different years', () => {
      const txDec = makeTransaction('tx-a', new Date('2024-12-15'))
      const txJan = makeTransaction('tx-b', new Date('2025-01-15'))
      render(
        <TransactionList {...defaultProps} transactions={[txDec, txJan]} />
      )
      expect(screen.getByText(/december 2024/i)).toBeInTheDocument()
      expect(screen.getByText(/januari 2025/i)).toBeInTheDocument()
    })

    it('does not render a month header when adjacent transactions share the same month and year', () => {
      const tx1 = makeTransaction('tx-a', new Date('2025-03-05'))
      const tx2 = makeTransaction('tx-b', new Date('2025-03-20'))
      render(
        <TransactionList {...defaultProps} transactions={[tx1, tx2]} />
      )
      // Only one "maart 2025" header should appear
      expect(screen.getAllByText(/maart 2025/i)).toHaveLength(1)
    })

    it('renders the month header label in Dutch (nl-NL locale)', () => {
      const txJune = makeTransaction('tx-a', new Date('2025-06-10'))
      render(
        <TransactionList {...defaultProps} transactions={[txJune]} />
      )
      expect(screen.getByText(/juni 2025/i)).toBeInTheDocument()
    })
  })

  describe('scroll sentinel', () => {
    it('renders the sentinel div at the bottom of the list', () => {
      const loadMoreRef = jest.fn()
      render(
        <TransactionList
          {...defaultProps}
          transactions={[mockTransaction]}
          loadMoreRef={loadMoreRef}
        />
      )
      // The sentinel is a div with class h-4 at the end of the list
      expect(loadMoreRef).toHaveBeenCalled()
    })
  })
})
