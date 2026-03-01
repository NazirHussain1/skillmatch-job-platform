import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import applicationService from '../../services/applicationService';

const initialState = {
  applications: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get user applications
export const getApplications = createAsyncThunk(
  'applications/getAll',
  async (_, thunkAPI) => {
    try {
      return await applicationService.getMyApplications();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create application
export const createApplication = createAsyncThunk(
  'applications/create',
  async (jobId, thunkAPI) => {
    try {
      return await applicationService.createApplication(jobId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getApplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.applications = action.payload;
      })
      .addCase(getApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.applications.push(action.payload);
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = applicationSlice.actions;
export default applicationSlice.reducer;
