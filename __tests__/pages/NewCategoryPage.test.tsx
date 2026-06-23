import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewCategoryPage from '@/app/(protected)/books/[id]/categories/new/page'
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes'
import { createCategory } from '@/lib/firestore/categories'
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
jest.mock('@/lib/firestore/categories', () => ({
  createCategory: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/components/CategoryForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (data: object) => void }) => (
    <button onClick={() => onSubmit({ name: 'Boodschappen', maxBudget: 300 })}>
      Toevoegen
    </button>
  ),
}))

describe('NewCategoryPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the CategoryForm for the owner', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    render(<NewCategoryPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Toevoegen' })).toBeInTheDocument()
    })
  })

  it('redirects non-owners back to the categories page', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue({ ...mockBook, ownerUid: 'other-user' })
    render(<NewCategoryPage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/books/book-1/categories')
    })
  })

  it('calls createCategory and navigates to the categories page on submit', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    ;(createCategory as jest.Mock).mockResolvedValue(undefined)
    render(<NewCategoryPage />)
    await waitFor(() => screen.getByRole('button', { name: 'Toevoegen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toevoegen' }))
    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith('book-1', { name: 'Boodschappen', maxBudget: 300 })
      expect(mockPush).toHaveBeenCalledWith('/books/book-1/categories')
    })
  })
})
