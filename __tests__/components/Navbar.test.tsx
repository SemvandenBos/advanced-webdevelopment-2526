import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '@/components/layout/Navbar'
import { mockUser } from '../fixtures'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
  })

  describe('rendering', () => {
    it('renders the "Huishoudboekjes" navigation link', () => {
      render(<Navbar />)
      expect(screen.getByRole('link', { name: /huishoudboekjes/i })).toHaveAttribute(
        'href',
        '/books'
      )
    })

    it("renders the logged-in user's email address", () => {
      render(<Navbar />)
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('renders the "Uitloggen" button when a user is signed in', () => {
      render(<Navbar />)
      expect(screen.getByRole('button', { name: /uitloggen/i })).toBeInTheDocument()
    })

    it('does not render the email or sign-out button when no user is present', () => {
      ;(useAuth as jest.Mock).mockReturnValueOnce({ user: null })
      render(<Navbar />)
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /uitloggen/i })).not.toBeInTheDocument()
    })
  })

  describe('sign-out', () => {
    it('calls signOut when the "Uitloggen" button is clicked', async () => {
      render(<Navbar />)
      fireEvent.click(screen.getByRole('button', { name: /uitloggen/i }))
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })
    })

    it('redirects to /login after successful sign-out', async () => {
      render(<Navbar />)
      fireEvent.click(screen.getByRole('button', { name: /uitloggen/i }))
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })
  })
})
