export const getFirestore = jest.fn(() => ({}))
export const collection = jest.fn()
export const doc = jest.fn()
export const getDoc = jest.fn()
export const getDocs = jest.fn()
export const addDoc = jest.fn()
export const updateDoc = jest.fn()
export const deleteDoc = jest.fn()
export const setDoc = jest.fn()
export const query = jest.fn()
export const where = jest.fn()
export const orderBy = jest.fn()
export const limit = jest.fn()
export const startAfter = jest.fn()
export const onSnapshot = jest.fn()
export const arrayUnion = jest.fn()
export const arrayRemove = jest.fn()
export const serverTimestamp = jest.fn()
export const Timestamp = {
  fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  now: jest.fn(),
}
