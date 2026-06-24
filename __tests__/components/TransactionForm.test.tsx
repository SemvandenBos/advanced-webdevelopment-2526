import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TransactionForm from '@/components/transactions/TransactionForm'
import { mockCategory, mockCategory2 } from '../fixtures'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

const defaultProps = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  submitLabel: 'Opslaan',
}

describe('TransactionForm', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('rendering', () => {
    it('renders income and expense type toggle buttons', () => {
      render(<TransactionForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: /uitgave/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /inkomsten/i })).toBeInTheDocument()
    })

    it('renders a date input defaulting to today', () => {
      const today = new Date()
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const { container } = render(<TransactionForm {...defaultProps} />)
      expect(container.querySelector('[type="date"]')).toHaveValue(iso)
    })

    it('pre-fills fields from the initial prop when provided', () => {
      render(
        <TransactionForm
          {...defaultProps}
          initial={{ amount: '99', description: 'Test', type: 'income' }}
        />
      )
      expect(screen.getByDisplayValue('99')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })
  })

  describe('type toggle', () => {
    it('applies green styling to the income button when income type is selected', async () => {
      render(<TransactionForm {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: /inkomsten/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /inkomsten/i })).toHaveClass('bg-green-500')
      })
    })

  })

  describe('category dropdown', () => {
    it('renders a category dropdown when the categories prop is provided', () => {
      render(<TransactionForm {...defaultProps} categories={[mockCategory]} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('does not render a category dropdown when categories prop is absent', () => {
      render(<TransactionForm {...defaultProps} />)
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('lists each category as an option in the dropdown', () => {
      render(
        <TransactionForm {...defaultProps} categories={[mockCategory, mockCategory2]} />
      )
      expect(screen.getByRole('option', { name: 'Boodschappen' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Transport' })).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows an error when the form is submitted with amount of zero', async () => {
      const { container } = render(<TransactionForm {...defaultProps} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
      fireEvent.submit(container.querySelector('form')!)
      await waitFor(() => {
        expect(screen.getByText(/geldig bedrag/i)).toBeInTheDocument()
      })
    })

    it('does not call onSubmit when validation fails', async () => {
      const onSubmit = jest.fn()
      const { container } = render(<TransactionForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.submit(container.querySelector('form')!)
      await waitFor(() => screen.getByText(/geldig bedrag/i))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with the correct type, amount, description, and date', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      const { container } = render(<TransactionForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } })
      fireEvent.change(screen.getByPlaceholderText('Optionele omschrijving'), {
        target: { value: 'Supermarkt' },
      })
      fireEvent.change(container.querySelector('[type="date"]')!, {
        target: { value: '2025-03-15' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'expense',
            amount: 50,
            description: 'Supermarkt',
            date: new Date('2025-03-15'),
          })
        )
      })
    })

    it('includes the selected categoryId in the submit payload', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<TransactionForm {...defaultProps} onSubmit={onSubmit} categories={[mockCategory]} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } })
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat-1' } })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ categoryId: 'cat-1' })
        )
      })
    })

  })
})
