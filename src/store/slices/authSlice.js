import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';
import { auth } from '../../firebase'; // ✅ Firebase import

// ===== EXISTING THUNKS =====
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/signup', userData);
      
      // ✅ Save role to localStorage as backup
      localStorage.setItem('userRole', 'user');
      
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Server connection failed!");
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
      localStorage.setItem('userRole', 'user'); // ✅ Save role
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed!");
    }
  }
);

export const registerDoctor = createAsyncThunk(
  'auth/registerDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctor/signup', doctorData);
      
      // ✅ Save role to localStorage as backup
      localStorage.setItem('userRole', 'doctor');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Doctor registration failed!");
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
      localStorage.setItem('userRole', 'doctor'); // ✅ Save role
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Doctor login failed!");
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
        error.response?.data?.error || 'Failed to send reset email. Try again.'
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
        error.response?.data?.error || 'Error resetting password'
      );
    }
  }
);

// ===== STATE =====
const savedUser = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: savedUser || null,
  role: savedUser?.role || localStorage.getItem('userRole') || null, // ✅ Fallback to localStorage
  isAuthenticated: !!savedUser,
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
      state.error = action.payload;
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
        state.forgotPassword.error = action.payload;
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
        state.resetPassword.error = action.payload;
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
        (state, action) => {
          state.loading = false;
          state.role = action.payload?.user?.role || null; // ✅ Set role after register
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
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.role = action.payload.user.role; 
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { logout, clearError, setError, clearPasswordMessages } = authSlice.actions;
export default authSlice.reducer;