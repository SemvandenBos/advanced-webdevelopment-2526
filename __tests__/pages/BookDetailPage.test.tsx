import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import BookDetailPage from '@/app/(protected)/books/[id]/page'
import { getHuishoudboekje } from '@/lib/firestore/huishoudboekjes'
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
  deleteTransaction: jest.fn(),
  updateTransaction: jest.fn(),
}))
jest.mock('@/hooks/useTransactions', () => ({
  useInfiniteTransactions: () => ({
    transactions: [],
    loadMore: jest.fn(),
    loading: false,
    hasMore: false,
  }),
  useMonthlyChartData: () => ({ data: [] }),
}))
jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ categories: [] }),
  useCategorySpending: () => ({ spending: new Map() }),
}))
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false }),
}))
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}))
jest.mock('next/dynamic', () => (_fn: unknown) => () => null)
jest.mock('@/components/TransactionList', () => ({
  __esModule: true,
  default: () => <div data-testid="transaction-list" />,
}))
jest.mock('@/components/CategoryPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="category-panel" />,
}))
jest.mock('@/components/TransactionDragPreview', () => ({
  __esModule: true,
  default: () => null,
}))

describe('BookDetailPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows loading text while book is fetching', () => {
    ;(getHuishoudboekje as jest.Mock).mockReturnValue(new Promise(() => {}))
    render(<BookDetailPage />)
    expect(screen.getByText(/laden/i)).toBeInTheDocument()
  })

  it('renders book name and description after load', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    render(<BookDetailPage />)
    await waitFor(() => {
      expect(screen.getByText('Testboekje')).toBeInTheDocument()
      expect(screen.getByText('Een testomschrijving')).toBeInTheDocument()
    })
  })

  it('shows owner-only controls (Bewerken, + Transactie) for the owner', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue(mockBook)
    render(<BookDetailPage />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /bewerken/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /transactie/i })).toBeInTheDocument()
    })
  })

  it('redirects to /books when the book is archived', async () => {
    ;(getHuishoudboekje as jest.Mock).mockResolvedValue({ ...mockBook, archived: true })
    render(<BookDetailPage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/books')
    })
  })
})
