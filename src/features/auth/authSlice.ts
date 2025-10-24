import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { auth } from "../../lib/firebase"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

export interface AuthSliceState {
  user: User | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

const initialState: AuthSliceState = {
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
}

export const authSlice = createAppSlice({
  name: "auth",

  initialState,

  reducers: create => ({
    // Set user from auth state change
    setUser: create.reducer((state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isInitialized = true
      state.isLoading = false
    }),

    // Clear error
    clearError: create.reducer(state => {
      state.error = null
    }),

    // Login with email and password
    login: create.asyncThunk(
      async ({ email, password }: { email: string; password: string }) => {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        )
        return userCredential.user
      },
      {
        pending: state => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action) => {
          state.user = action.payload
          state.isLoading = false
          state.error = null
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error =
            action.error.message || "Failed to login. Please try again."
        },
      },
    ),

    // Logout
    logout: create.asyncThunk(
      async () => {
        await signOut(auth)
      },
      {
        pending: state => {
          state.isLoading = true
        },
        fulfilled: state => {
          state.user = null
          state.isLoading = false
          state.error = null
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error =
            action.error.message || "Failed to logout. Please try again."
        },
      },
    ),
  }),

  selectors: {
    selectUser: state => state.user,
    selectIsLoading: state => state.isLoading,
    selectError: state => state.error,
    selectIsAuthenticated: state => state.user !== null,
    selectIsInitialized: state => state.isInitialized,
  },
})

export const { setUser, clearError, login, logout } = authSlice.actions

export const {
  selectUser,
  selectIsLoading,
  selectError,
  selectIsAuthenticated,
  selectIsInitialized,
} = authSlice.selectors

// Setup auth state listener
export const setupAuthListener = (dispatch: any) => {
  return onAuthStateChanged(auth, user => {
    dispatch(setUser(user))
  })
}
