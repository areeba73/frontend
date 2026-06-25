
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';
const getErrorMessage = (error, fallback) => {
  if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
    return 'Login request timed out. Please check your internet connection and try again.';
  }

  const payload = error?.response?.data?.error || error?.response?.data || error;

  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  if (payload?.error && typeof payload.error === 'string') return payload.error;

  return fallback;
};

// ===== EXISTING THUNKS =====
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/signup', userData);
      
      // ✅ Save role to localStorage as backup
      
      return response.data; 
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Server connection failed!"));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', credentials);
      const data = response.data;
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token || '');
      localStorage.setItem('userRole', data.user?.role || 'user');
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed!"));
    }
  }
);

export const registerDoctor = createAsyncThunk(
  'auth/registerDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctor/signup', doctorData);
      
      // ✅ Save role to localStorage as backup
      
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Doctor registration failed!"));
    }
  }
);

export const loginDoctor = createAsyncThunk(
  'auth/loginDoctor',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctor/login', credentials);
      const data = response.data;
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token || '');
      localStorage.setItem('userRole', data.user?.role || 'doctor');
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Doctor login failed!"));
    }
  }
);

// ===== NEW THUNKS =====
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        message: response.data.message,
        success: true,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to send reset email. Try again.')
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ oobCode, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/complete-reset', {
        oobCode,
        newPassword,
      });
      return {
        message: response.data.message,
        success: true,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Error resetting password')
      );
    }
  }
);

// ===== STATE =====
const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const savedUser = getSavedUser();
const savedToken = localStorage.getItem('token');
const hasValidSession = Boolean(savedUser && savedToken);

const initialState = {
  user: hasValidSession ? savedUser : null,
  role: hasValidSession ? (savedUser?.role || localStorage.getItem('userRole')) : null,
  isAuthenticated: hasValidSession,
  loading: false,
  error: null,
  forgotPassword: {
    loading: false,
    message: '',
    error: '',
    success: false,
  },
  resetPassword: {
    loading: false,
    message: '',
    error: '',
    success: false,
  },
};

// ===== SLICE =====
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole'); // ✅ Clear role
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = getErrorMessage(action.payload, 'Something went wrong');
    },
    updateCurrentUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      state.role = state.user?.role || state.role;
      localStorage.setItem('user', JSON.stringify(state.user));
      if (state.role) {
        localStorage.setItem('userRole', state.role);
      }
    },
    clearPasswordMessages: (state) => {
      state.forgotPassword.message = '';
      state.forgotPassword.error = '';
      state.resetPassword.message = '';
      state.resetPassword.error = '';
    },
  },
  extraReducers: (builder) => {
    // ===== FORGOT PASSWORD CASES =====
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPassword.loading = true;
        state.forgotPassword.error = '';
        state.forgotPassword.message = '';
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPassword.loading = false;
        state.forgotPassword.message = action.payload.message;
        state.forgotPassword.success = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPassword.loading = false;
        state.forgotPassword.error = getErrorMessage(action.payload, 'Failed to send reset email. Try again.');
        state.forgotPassword.success = false;
      })
      // ===== RESET PASSWORD CASES =====
      .addCase(resetPassword.pending, (state) => {
        state.resetPassword.loading = true;
        state.resetPassword.error = '';
        state.resetPassword.message = '';
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPassword.loading = false;
        state.resetPassword.message = action.payload.message;
        state.resetPassword.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPassword.loading = false;
        state.resetPassword.error = getErrorMessage(action.payload, 'Error resetting password');
        state.resetPassword.success = false;
      })
      // ===== MATCHERS =====
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.includes('register'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && action.type.includes('register'),
        (state) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.includes('login'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && action.type.includes('login'),
        (state, action) => {
          state.loading = false;
          state.isAuthenticated = Boolean(action.payload?.user && action.payload?.token);
          state.user = action.payload.user;
          state.role = action.payload.user?.role || null; 
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = getErrorMessage(action.payload, 'Something went wrong');
        }
      );
  },
});

export const { logout, clearError, setError, updateCurrentUser, clearPasswordMessages } = authSlice.actions;
export default authSlice.reducer;
