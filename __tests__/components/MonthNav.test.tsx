import { render, screen, fireEvent } from '@testing-library/react'
import MonthNav from '@/components/MonthNav'

describe('MonthNav', () => {
  afterEach(() => jest.useRealTimers())

  describe('rendering', () => {
    it('renders the month name in Dutch', () => {
      render(<MonthNav year={2025} month={2} onChange={jest.fn()} />)
      expect(screen.getByText(/maart/i)).toBeInTheDocument()
    })

    it('renders the year alongside the month name', () => {
      render(<MonthNav year={2025} month={2} onChange={jest.fn()} />)
      expect(screen.getByText(/2025/)).toBeInTheDocument()
    })

    it('renders back and forward navigation buttons', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-06-10'))
      render(<MonthNav year={2025} month={3} onChange={jest.fn()} />)
      expect(screen.getByLabelText('Vorige maand')).toBeInTheDocument()
      expect(screen.getByLabelText('Volgende maand')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('calls onChange with the previous month when the back button is clicked', () => {
      const onChange = jest.fn()
      render(<MonthNav year={2025} month={5} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Vorige maand'))
      expect(onChange).toHaveBeenCalledWith(2025, 4)
    })

    it('calls onChange with the next month when the forward button is clicked', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-06-10'))
      const onChange = jest.fn()
      render(<MonthNav year={2025} month={3} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Volgende maand'))
      expect(onChange).toHaveBeenCalledWith(2025, 4)
    })

  })

  describe('current month boundary', () => {
    it('disables the forward button when displaying the current month', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-06-10'))
      render(<MonthNav year={2025} month={5} onChange={jest.fn()} />)
      expect(screen.getByLabelText('Volgende maand')).toBeDisabled()
    })

  })
})
