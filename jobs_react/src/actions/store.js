import { configureStore } from '@reduxjs/toolkit'
import applicantSlice from "../slices/applicantSlice";

export const store = configureStore({
  reducer: {
    applicants: applicantSlice.reducer,
  },
})

export const ACTION_TYPES = {
  FETCH_APPLICANTS_START: "FETCH_APPLICANTS_START",
  FETCH_APPLICANTS_SUCCESS: "FETCH_APPLICANTS_SUCCESS",
  FETCH_APPLICANTS_FAILURE: "FETCH_APPLICANTS_FAILURE"
};

export const fetchAll = () => {
  return async (dispatch) => {
    dispatch(applicantSlice.actions.fetchApplicantsStart());
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await response.json();
      dispatch(applicantSlice.actions.fetchApplicantsSuccess(data));
    } catch (error) {
      dispatch(applicantSlice.actions.fetchApplicantsFailure(error.message));
    }
  };
}