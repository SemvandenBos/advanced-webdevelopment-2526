import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ShareModal from '@/components/ShareModal'
import { mockBook, mockUser, mockMember } from '../fixtures'
import { getUserByEmail, getUserDocument } from '@/lib/firestore/users'
import { addMember, removeMember } from '@/lib/firestore/huishoudboekjes'

jest.mock('@/lib/firestore/users', () => ({
  getUserByEmail: jest.fn(),
  getUserDocument: jest.fn(),
}))

jest.mock('@/lib/firestore/huishoudboekjes', () => ({
  addMember: jest.fn().mockResolvedValue(undefined),
  removeMember: jest.fn().mockResolvedValue(undefined),
}))

const defaultProps = {
  book: mockBook,
  currentUserUid: 'user-owner',
  onClose: jest.fn(),
}

describe('ShareModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getUserDocument as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockMember)
  })

  describe('rendering', () => {
    it('renders a modal overlay', async () => {
      await act(async () => { render(<ShareModal {...defaultProps} />) })
      expect(screen.getByText(/delen: testboekje/i)).toBeInTheDocument()
    })

    it('renders the email input and invite button', async () => {
      await act(async () => { render(<ShareModal {...defaultProps} />) })
      expect(screen.getByPlaceholderText(/e-mailadres uitnodigen/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /uitnodigen/i })).toBeInTheDocument()
    })

    it('renders the current members list on mount', async () => {
      render(<ShareModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument()
        expect(screen.getByText('Member User')).toBeInTheDocument()
      })
    })
  })

  describe('invite flow', () => {
    it('shows an error when the entered email does not belong to any user', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      render(<ShareModal {...defaultProps} />)
      fireEvent.change(screen.getByPlaceholderText(/e-mailadres uitnodigen/i), {
        target: { value: 'nobody@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))
      await waitFor(() => {
        expect(screen.getByText(/geen gebruiker gevonden/i)).toBeInTheDocument()
      })
    })

    it('shows an error when the user is already a member', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue({ uid: 'user-2', email: 'member@example.com' })
      render(<ShareModal {...defaultProps} />)
      fireEvent.change(screen.getByPlaceholderText(/e-mailadres uitnodigen/i), {
        target: { value: 'member@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))
      await waitFor(() => {
        expect(screen.getByText(/al lid/i)).toBeInTheDocument()
      })
    })

    it('calls addMember with the book id and user id on a valid invite', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue({
        uid: 'user-new',
        email: 'new@example.com',
      })
      render(<ShareModal {...defaultProps} />)
      fireEvent.change(screen.getByPlaceholderText(/e-mailadres uitnodigen/i), {
        target: { value: 'new@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))
      await waitFor(() => {
        expect(addMember).toHaveBeenCalledWith('book-1', 'user-new')
      })
    })

    it('shows a success message after a successful invite', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue({
        uid: 'user-new',
        email: 'new@example.com',
      })
      render(<ShareModal {...defaultProps} />)
      fireEvent.change(screen.getByPlaceholderText(/e-mailadres uitnodigen/i), {
        target: { value: 'new@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))
      await waitFor(() => {
        expect(screen.getByText(/succesvol toegevoegd/i)).toBeInTheDocument()
      })
    })

  })

  describe('remove member', () => {
    it('renders a remove button for each non-current-user member', async () => {
      render(<ShareModal {...defaultProps} currentUserUid="other-user" />)
      await waitFor(() => screen.getByText('Test User'))
      expect(screen.getAllByRole('button', { name: /verwijderen/i })).toHaveLength(2)
    })

    it('calls removeMember with the book id and member uid when remove is clicked', async () => {
      render(<ShareModal {...defaultProps} currentUserUid="other-user" />)
      await waitFor(() => screen.getByText('Test User'))
      fireEvent.click(screen.getAllByRole('button', { name: /verwijderen/i })[0])
      await waitFor(() => {
        expect(removeMember).toHaveBeenCalledWith('book-1', mockUser.uid)
      })
    })

    it('does not render a remove button for the current user', async () => {
      render(<ShareModal {...defaultProps} currentUserUid={mockUser.uid} />)
      await waitFor(() => screen.getByText('Test User'))
      // user-1 (mockUser) is the current user, so only user-2 (mockMember) has a remove button
      expect(screen.getAllByRole('button', { name: /verwijderen/i })).toHaveLength(1)
    })
  })

})
