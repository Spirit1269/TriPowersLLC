import { configureStore } from '@reduxjs/toolkit';
import applicantsReducer from '../slices/applicantsSlice';
import authReducer from '../slices/authSlice';
import jobsReducer from '../slices/jobsSlice';

export const store = configureStore({
  reducer: {
    auth:authReducer,
    jobs: jobsSlice.reducer,
    applications: applicationsSlice.reducer,
  },
})