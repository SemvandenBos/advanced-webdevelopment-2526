import { render, screen } from '@testing-library/react'
import BooksPage from '@/app/(protected)/books/page'
import { useHuishoudboekjes } from '@/hooks/useHuishoudboekjes'
import { mockBook, mockUser } from '../fixtures'

jest.mock('@/hooks/useHuishoudboekjes', () => ({
  useHuishoudboekjes: jest.fn(),
}))
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))
jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  archiveHuishoudboekje: jest.fn(),
}))
jest.mock('@/components/HuishoudboekjeCard', () => ({
  __esModule: true,
  default: ({ book }: { book: { name: string } }) => (
    <div data-testid="book-card">{book.name}</div>
  ),
}))
jest.mock('@/components/skeletons/BookCardSkeleton', () => ({
  BooksListSkeleton: () => <div data-testid="books-skeleton" />,
}))

describe('BooksPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows the loading skeleton while books are loading', () => {
    ;(useHuishoudboekjes as jest.Mock).mockReturnValue({ books: [], loading: true })
    render(<BooksPage />)
    expect(screen.getByTestId('books-skeleton')).toBeInTheDocument()
  })

  it('renders owned books under "Mijn boekjes"', () => {
    ;(useHuishoudboekjes as jest.Mock).mockReturnValue({
      books: [{ ...mockBook, ownerUid: 'user-1' }],
      loading: false,
    })
    render(<BooksPage />)
    expect(screen.getByText(/mijn boekjes/i)).toBeInTheDocument()
    expect(screen.getByTestId('book-card')).toBeInTheDocument()
  })

  it('renders shared books under "Gedeeld met mij"', () => {
    ;(useHuishoudboekjes as jest.Mock).mockReturnValue({
      books: [{ ...mockBook, ownerUid: 'other-user' }],
      loading: false,
    })
    render(<BooksPage />)
    expect(screen.getByText(/gedeeld met mij/i)).toBeInTheDocument()
  })

  it('shows empty-state message when user has no owned books', () => {
    ;(useHuishoudboekjes as jest.Mock).mockReturnValue({ books: [], loading: false })
    render(<BooksPage />)
    expect(screen.getByText(/nog geen boekjes/i)).toBeInTheDocument()
  })
})
