import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/LoginForm'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth'
import { FirebaseError } from 'firebase/app'

jest.mock('@/lib/auth', () => ({
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('initial rendering', () => {
    it('renders in sign-in mode by default', () => {
      render(<LoginForm onSuccess={jest.fn()} />)
      expect(screen.getByRole('button', { name: 'Inloggen' })).toBeInTheDocument()
    })

    it('does not show the name field in sign-in mode', () => {
      render(<LoginForm onSuccess={jest.fn()} />)
      expect(screen.queryByText('Naam')).not.toBeInTheDocument()
    })

  })

  describe('mode toggle', () => {
    it('shows the name field after clicking "Registreren"', async () => {
      render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => {
        expect(screen.getByText('Naam')).toBeInTheDocument()
      })
    })

    it('changes submit label to "Account aanmaken" in sign-up mode', async () => {
      render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Account aanmaken' })).toBeInTheDocument()
      })
    })

  })

  describe('sign-in submission', () => {
    it('calls signInWithEmail with entered email and password', async () => {
      ;(signInWithEmail as jest.Mock).mockResolvedValue({})
      const { container } = render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'secret123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      await waitFor(() => {
        expect(signInWithEmail).toHaveBeenCalledWith('user@example.com', 'secret123')
      })
    })

    it('calls onSuccess after successful sign-in', async () => {
      ;(signInWithEmail as jest.Mock).mockResolvedValue({})
      const onSuccess = jest.fn()
      const { container } = render(<LoginForm onSuccess={onSuccess} />)
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'secret' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it('shows a friendly error message when signInWithEmail throws a FirebaseError', async () => {
      ;(signInWithEmail as jest.Mock).mockRejectedValue(
        new FirebaseError('auth/wrong-password', 'Wrong password')
      )
      const { container } = render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      await waitFor(() => {
        expect(screen.getByText(/ongeldig e-mailadres of wachtwoord/i)).toBeInTheDocument()
      })
    })

  })

  describe('sign-up submission', () => {
    it('calls signUpWithEmail with name, email, and password', async () => {
      ;(signUpWithEmail as jest.Mock).mockResolvedValue({})
      const { container } = render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => screen.getByText('Naam'))
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Jan Jansen' },
      })
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'jan@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'pass123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Account aanmaken' }))
      await waitFor(() => {
        expect(signUpWithEmail).toHaveBeenCalledWith('jan@example.com', 'pass123', 'Jan Jansen')
      })
    })

    it('calls onSuccess after successful sign-up', async () => {
      ;(signUpWithEmail as jest.Mock).mockResolvedValue({})
      const onSuccess = jest.fn()
      const { container } = render(<LoginForm onSuccess={onSuccess} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => screen.getByText('Naam'))
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Jan Jansen' },
      })
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'jan@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'pass123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Account aanmaken' }))
      await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    })

    it('shows a friendly error when the email is already in use', async () => {
      ;(signUpWithEmail as jest.Mock).mockRejectedValue(
        new FirebaseError('auth/email-already-in-use', '')
      )
      const { container } = render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => screen.getByText('Naam'))
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Test Naam' },
      })
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'taken@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: 'pass123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Account aanmaken' }))
      await waitFor(() => {
        expect(screen.getByText(/al in gebruik/i)).toBeInTheDocument()
      })
    })

    it('shows a friendly error when the password is too weak', async () => {
      ;(signUpWithEmail as jest.Mock).mockRejectedValue(
        new FirebaseError('auth/weak-password', '')
      )
      const { container } = render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /registreren/i }))
      await waitFor(() => screen.getByText('Naam'))
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Test Naam' },
      })
      fireEvent.change(container.querySelector('[type="email"]')!, {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(container.querySelector('[type="password"]')!, {
        target: { value: '123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Account aanmaken' }))
      await waitFor(() => {
        expect(screen.getByText(/minimaal 6 tekens/i)).toBeInTheDocument()
      })
    })
  })

  describe('Google sign-in', () => {
    it('calls signInWithGoogle when the Google button is clicked', async () => {
      ;(signInWithGoogle as jest.Mock).mockResolvedValue({})
      render(<LoginForm onSuccess={jest.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /google/i }))
      await waitFor(() => {
        expect(signInWithGoogle).toHaveBeenCalled()
      })
    })

  })
})
