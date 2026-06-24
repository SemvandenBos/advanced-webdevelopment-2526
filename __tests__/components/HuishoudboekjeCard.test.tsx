import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HuishoudboekjeCard from '@/components/books/HuishoudboekjeCard'
import { mockBook, mockUser } from '../fixtures'

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  addMember: jest.fn(),
  removeMember: jest.fn(),
}))

jest.mock('@/lib/firestore/users', () => ({
  getUserByEmail: jest.fn(),
  getUserDocument: jest.fn().mockResolvedValue(null),
}))

describe('HuishoudboekjeCard', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('whole card click', () => {
    it('navigates to the book page when clicking anywhere on the card', () => {
      render(<HuishoudboekjeCard book={mockBook} isOwner={true} onArchive={jest.fn()} />)
      fireEvent.click(screen.getByText('Een testomschrijving'))
      expect(mockPush).toHaveBeenCalledWith('/books/book-1')
    })

  })

  describe('non-archived book: owner', () => {
    it('renders the book name as a clickable link', () => {
      render(<HuishoudboekjeCard book={mockBook} isOwner={true} />)
      expect(screen.getByRole('link', { name: 'Testboekje' })).toHaveAttribute(
        'href',
        '/books/book-1'
      )
    })

    it('renders the book description when present', () => {
      render(<HuishoudboekjeCard book={mockBook} isOwner={true} />)
      expect(screen.getByText('Een testomschrijving')).toBeInTheDocument()
    })

    it('renders "Delen", "Bewerken", and "Archiveren" buttons for the owner', () => {
      render(
        <HuishoudboekjeCard
          book={mockBook}
          isOwner={true}
          onArchive={jest.fn()}
        />
      )
      expect(screen.getByRole('button', { name: /delen/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /bewerken/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /archiveren/i })).toBeInTheDocument()
    })

    it('calls onArchive with the book id when "Archiveren" is clicked', () => {
      const onArchive = jest.fn()
      render(
        <HuishoudboekjeCard book={mockBook} isOwner={true} onArchive={onArchive} />
      )
      fireEvent.click(screen.getByRole('button', { name: /archiveren/i }))
      expect(onArchive).toHaveBeenCalledWith('book-1')
    })

    it('opens the ShareModal when "Delen" is clicked', async () => {
      render(<HuishoudboekjeCard book={mockBook} isOwner={true} />)
      fireEvent.click(screen.getByRole('button', { name: /delen/i }))
      await waitFor(() => {
        expect(screen.getByText(/delen: testboekje/i)).toBeInTheDocument()
      })
    })
  })

  describe('non-archived book: member (non-owner)', () => {
    it('does not render "Delen", "Bewerken", or "Archiveren" buttons', () => {
      render(<HuishoudboekjeCard book={mockBook} isOwner={false} />)
      expect(screen.queryByRole('button', { name: /delen/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /bewerken/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /archiveren/i })).not.toBeInTheDocument()
    })
  })

  describe('archived book: owner', () => {
    const archivedBook = { ...mockBook, archived: true }

    it('renders the book name as plain text (not a link)', () => {
      render(
        <HuishoudboekjeCard
          book={archivedBook}
          isOwner={true}
          onRestore={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      expect(screen.queryByRole('link', { name: 'Testboekje' })).not.toBeInTheDocument()
      expect(screen.getByText('Testboekje')).toBeInTheDocument()
    })

    it('renders "Terugzetten" and "Verwijderen" buttons', () => {
      render(
        <HuishoudboekjeCard
          book={archivedBook}
          isOwner={true}
          onRestore={jest.fn()}
          onDelete={jest.fn()}
        />
      )
      expect(screen.getByRole('button', { name: /terugzetten/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verwijderen/i })).toBeInTheDocument()
    })

    it('calls onRestore with the book id when "Terugzetten" is clicked', () => {
      const onRestore = jest.fn()
      render(
        <HuishoudboekjeCard
          book={archivedBook}
          isOwner={true}
          onRestore={onRestore}
          onDelete={jest.fn()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /terugzetten/i }))
      expect(onRestore).toHaveBeenCalledWith('book-1')
    })

    it('calls onDelete with the book id when "Verwijderen" is clicked', () => {
      const onDelete = jest.fn()
      render(
        <HuishoudboekjeCard
          book={archivedBook}
          isOwner={true}
          onRestore={jest.fn()}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /verwijderen/i }))
      expect(onDelete).toHaveBeenCalledWith('book-1')
    })
  })

})
