import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/login/page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('@/components/LoginForm', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess}>Inloggen</button>
  ),
}))

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the LoginForm', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Inloggen' })).toBeInTheDocument()
  })

  it('redirects to /books after successful login', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/books')
    })
  })
})
