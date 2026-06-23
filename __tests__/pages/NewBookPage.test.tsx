import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewBookPage from '@/app/(protected)/books/new/page'
import { createHuishoudboekje } from '@/lib/firestore/huishoudboekjes'
import { mockUser } from '../fixtures'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))
jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  createHuishoudboekje: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/components/HuishoudboekjeForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (name: string, description: string) => void }) => (
    <button onClick={() => onSubmit('Testboekje', 'Omschrijving')}>Aanmaken</button>
  ),
}))

describe('NewBookPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the HuishoudboekjeForm', () => {
    render(<NewBookPage />)
    expect(screen.getByRole('button', { name: 'Aanmaken' })).toBeInTheDocument()
  })

  it('calls createHuishoudboekje and navigates to /books on submit', async () => {
    ;(createHuishoudboekje as jest.Mock).mockResolvedValue(undefined)
    render(<NewBookPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Aanmaken' }))
    await waitFor(() => {
      expect(createHuishoudboekje).toHaveBeenCalledWith('user-1', {
        name: 'Testboekje',
        description: 'Omschrijving',
      })
      expect(mockPush).toHaveBeenCalledWith('/books')
    })
  })
})
