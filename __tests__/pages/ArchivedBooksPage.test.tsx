import { render, screen } from '@testing-library/react'
import ArchivedBooksPage from '@/app/(protected)/books/archived/page'
import { useArchivedHuishoudboekjes } from '@/hooks/useHuishoudboekjes'
import { mockBook, mockUser } from '../fixtures'

jest.mock('@/hooks/useHuishoudboekjes', () => ({
  useArchivedHuishoudboekjes: jest.fn(),
}))
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))
jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  restoreHuishoudboekje: jest.fn(),
  deleteHuishoudboekje: jest.fn(),
}))
jest.mock('@/components/books/HuishoudboekjeCard', () => ({
  __esModule: true,
  default: ({ book }: { book: { name: string } }) => (
    <div data-testid="book-card">{book.name}</div>
  ),
}))
jest.mock('@/components/skeletons/BookCardSkeleton', () => ({
  BooksListSkeleton: () => <div data-testid="books-skeleton" />,
}))

describe('ArchivedBooksPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders archived books', () => {
    ;(useArchivedHuishoudboekjes as jest.Mock).mockReturnValue({
      books: [{ ...mockBook, archived: true }],
      loading: false,
    })
    render(<ArchivedBooksPage />)
    expect(screen.getByText('Testboekje')).toBeInTheDocument()
  })

  it('shows empty-state message when no archived books', () => {
    ;(useArchivedHuishoudboekjes as jest.Mock).mockReturnValue({
      books: [],
      loading: false,
    })
    render(<ArchivedBooksPage />)
    expect(screen.getByText(/geen gearchiveerde boekjes/i)).toBeInTheDocument()
  })
})
