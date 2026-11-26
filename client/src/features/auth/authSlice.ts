import { createSlice } from '@reduxjs/toolkit';
import { createAppAsyncThunk, toFailure } from '../../app/thunk';
import type { LoadStatus, LoginInput, RegisterInput, User } from '../../types';

export interface AuthState {
  user: User | null;
  status: LoadStatus;
  submitting: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  status: 'idle',
  submitting: false,
  error: null,
};

export const fetchCurrentUser = createAppAsyncThunk('auth/me', async (_: void, { extra, rejectWithValue }) => {
  try {
    return await extra.api.getCurrentUser();
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

export const loginUser = createAppAsyncThunk('auth/login', async (input: LoginInput, { extra, rejectWithValue }) => {
  try {
    return await extra.api.login(input);
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

export const registerUser = createAppAsyncThunk(
  'auth/register',
  async (input: RegisterInput, { extra, rejectWithValue }) => {
    try {
      return await extra.api.register(input);
    } catch (error) {
      return rejectWithValue(toFailure(error));
    }
  },
);

export const logoutUser = createAppAsyncThunk('auth/logout', async (_: void, { extra, rejectWithValue }) => {
  try {
    await extra.api.logout();
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'succeeded';
        state.user = null;
      })

      .addCase(loginUser.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.submitting = false;
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message ?? action.error.message ?? 'Не удалось войти';
      })

      .addCase(registerUser.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.submitting = false;
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message ?? action.error.message ?? 'Не удалось создать аккаунт';
      })

      .addCase(logoutUser.pending, (state) => {
        state.submitting = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.submitting = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message ?? action.error.message ?? 'Не удалось выйти';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
