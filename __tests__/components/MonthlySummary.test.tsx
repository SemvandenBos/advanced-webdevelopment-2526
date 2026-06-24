import { render, screen } from '@testing-library/react'
import MonthlySummary from '@/components/transactions/MonthlySummary'

// RTL normalizes element text (collapses   to space) but does NOT normalize the query string.
// So we normalize   in the query helper to get consistent matches.
const fmt = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })
    .format(n)
    .replace(/ /g, " ")

describe('MonthlySummary', () => {
  describe('rendering', () => {
    it('renders the income amount formatted as EUR currency', () => {
      render(<MonthlySummary income={1500} expenses={600} balance={900} />)
      expect(screen.getByText(fmt(1500))).toBeInTheDocument()
    })

    it('renders the balance amount formatted as EUR currency', () => {
      render(<MonthlySummary income={1500} expenses={600} balance={900} />)
      expect(screen.getByText(fmt(900))).toBeInTheDocument()
    })
  })

  describe('balance colour', () => {
    it('renders the balance in green when balance is positive', () => {
      render(<MonthlySummary income={2000} expenses={500} balance={1500} />)
      expect(screen.getByText(fmt(1500))).toHaveClass('text-green-600')
    })

    it('renders the balance in red when balance is negative', () => {
      render(<MonthlySummary income={500} expenses={2000} balance={-1500} />)
      expect(screen.getByText(fmt(-1500))).toHaveClass('text-red-600')
    })

  })
})
