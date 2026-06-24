import { render, screen } from '@testing-library/react'
import TransactionDragPreview from '@/components/transactions/TransactionDragPreview'
import { mockTransaction, mockIncomeTransaction } from '../fixtures'

describe('TransactionDragPreview', () => {
  it('renders a red colour indicator for expense type', () => {
    const { container } = render(<TransactionDragPreview transaction={mockTransaction} />)
    expect(container.querySelector('.bg-red-400')).toBeInTheDocument()
  })

  it('renders the expense amount with a minus sign', () => {
    render(<TransactionDragPreview transaction={mockTransaction} />)
    const el = screen.getByText(/42,50/)
    expect(el.textContent).toMatch(/-/)
  })

  it('renders a green colour indicator for income type', () => {
    const { container } = render(<TransactionDragPreview transaction={mockIncomeTransaction} />)
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
  })

  it('renders the income amount with a plus sign', () => {
    render(<TransactionDragPreview transaction={mockIncomeTransaction} />)
    const el = screen.getByText(/2\.000,00/)
    expect(el.textContent).toMatch(/\+/)
  })
})
