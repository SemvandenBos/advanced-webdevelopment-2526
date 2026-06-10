export class FirebaseError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'FirebaseError'
  }
}
export const initializeApp = jest.fn(() => ({}))
export const getApps = jest.fn(() => [])
export const getApp = jest.fn(() => ({}))
