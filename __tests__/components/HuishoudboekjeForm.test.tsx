import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HuishoudboekjeForm from '@/components/books/HuishoudboekjeForm'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

const defaultProps = {
  onSubmit: jest.fn().mockResolvedValue(undefined),
  submitLabel: 'Opslaan',
}

describe('HuishoudboekjeForm', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('rendering', () => {
    it('renders a name input field', () => {
      render(<HuishoudboekjeForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('bijv. Huishouden 2025')).toBeInTheDocument()
    })

    it('renders a description textarea', () => {
      render(<HuishoudboekjeForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('Optionele omschrijving')).toBeInTheDocument()
    })

    it('pre-fills the name input with initialName when provided', () => {
      render(<HuishoudboekjeForm {...defaultProps} initialName="Bestaand boekje" />)
      expect(screen.getByDisplayValue('Bestaand boekje')).toBeInTheDocument()
    })

    it('pre-fills the description textarea with initialDescription when provided', () => {
      render(<HuishoudboekjeForm {...defaultProps} initialDescription="Omschrijving" />)
      expect(screen.getByDisplayValue('Omschrijving')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows an error when the form is submitted with an empty name', async () => {
      render(<HuishoudboekjeForm {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(screen.getByText('Naam is verplicht.')).toBeInTheDocument()
      })
    })

    it('does not call onSubmit when name is empty', async () => {
      const onSubmit = jest.fn()
      render(<HuishoudboekjeForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => screen.getByText('Naam is verplicht.'))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    it('calls onSubmit with trimmed name and description on valid submit', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined)
      render(<HuishoudboekjeForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Huishouden 2025'), {
        target: { value: '  Mijn boekje  ' },
      })
      fireEvent.change(screen.getByPlaceholderText('Optionele omschrijving'), {
        target: { value: 'Omschrijving' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Mijn boekje', 'Omschrijving')
      })
    })

    it('shows an error message when onSubmit rejects', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('fail'))
      render(<HuishoudboekjeForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Huishouden 2025'), {
        target: { value: 'Test' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(screen.getByText(/er is iets misgegaan/i)).toBeInTheDocument()
      })
    })

    it('re-enables the submit button after onSubmit rejects', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('fail'))
      render(<HuishoudboekjeForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByPlaceholderText('bijv. Huishouden 2025'), {
        target: { value: 'Test' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Opslaan' })).not.toBeDisabled()
      })
    })
  })
})
