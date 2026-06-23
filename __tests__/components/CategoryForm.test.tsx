import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CategoryForm from '@/components/CategoryForm'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

const defaultProps = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  submitLabel: 'Opslaan',
}

describe('CategoryForm', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('rendering', () => {
    it('renders a name input field', () => {
      render(<CategoryForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('bijv. Boodschappen')).toBeInTheDocument()
    })

    it('renders a max budget input field', () => {
      render(<CategoryForm {...defaultProps} />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('pre-fills fields from the initial prop when provided', () => {
      render(
        <CategoryForm
          {...defaultProps}
          initial={{ name: 'Transport', maxBudget: '150', endDate: '2025-12-31' }}
        />
      )
      expect(screen.getByDisplayValue('Transport')).toBeInTheDocument()
      expect(screen.getByDisplayValue('150')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows an error when the form is submitted with an empty name', async () => {
      render(<CategoryForm {...defaultProps} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(screen.getByText('Naam is verplicht.')).toBeInTheDocument()
      })
    })

    it('shows an error when the budget is zero', async () => {
      const { container } = render(<CategoryForm {...defaultProps} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Boodschappen'), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
      fireEvent.submit(container.querySelector('form')!)
      await waitFor(() => {
        expect(screen.getByText(/geldig maximaal budget/i)).toBeInTheDocument()
      })
    })

    it('does not call onSubmit when validation fails', async () => {
      const onSubmit = jest.fn()
      render(<CategoryForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => screen.getByText('Naam is verplicht.'))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with name and maxBudget on valid submit', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<CategoryForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Boodschappen'), {
        target: { value: 'Boodschappen' },
      })
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Boodschappen', maxBudget: 200 })
        )
      })
    })

    it('includes endDate as a Date object when an end date is filled in', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      const { container } = render(<CategoryForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Boodschappen'), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } })
      fireEvent.change(container.querySelector('[type="date"]')!, {
        target: { value: '2025-12-31' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ endDate: new Date('2025-12-31') })
        )
      })
    })

    it('omits endDate from the submit payload when the field is left empty', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<CategoryForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Boodschappen'), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ endDate: undefined })
        )
      })
    })

  })
})
