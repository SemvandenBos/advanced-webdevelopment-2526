import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewTransactionPage from '@/app/(protected)/books/[id]/transactions/new/page'
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes'
import { createTransaction } from '@/lib/firestore/transactions'
import { mockBook, mockUser } from '../fixtures'

const mockReplace = jest.fn()
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'book-1' }),
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}))
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))
jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  getHuishoudboekje: jest.fn(),
}))
jest.mock('@/lib/firestore/transactions', () => ({
  createTransaction: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] }),
}))
jest.mock('@/components/transactions/TransactionForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (data: object) => void }) => (
    <button
      onClick={() =>
        onSubmit({ amount: 50, description: 'Test', date: new Date(), type: 'expense', categoryId: undefined })
      }
    >
      Toevoegen
    </button>
  ),
}))

describe('NewTransactionPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the TransactionForm for the owner', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    render(<NewTransactionPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Toevoegen' })).toBeInTheDocument()
    })
  })

  it('redirects non-owners back to the book page', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue({ ...mockBook, ownerUid: 'other-user' })
    render(<NewTransactionPage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/books/book-1')
    })
  })

  it('calls createTransaction and navigates to the book page on submit', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    ;(createTransaction as jest.Mock).mockResolvedValue(undefined)
    render(<NewTransactionPage />)
    await waitFor(() => screen.getByRole('button', { name: 'Toevoegen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toevoegen' }))
    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/books/book-1')
    })
  })
})
