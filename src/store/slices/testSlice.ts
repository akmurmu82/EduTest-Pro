import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestState, Test, TestAttempt, Question } from '../../types';
import { testsAPI, attemptsAPI } from '../../services/api';


export const fetchTests = createAsyncThunk('test/fetchTests', async () => {
  return await testsAPI.getTests();
});

export const startTest = createAsyncThunk(
  'test/start',
  async (testId: string) => {
    return await testsAPI.getTest(testId);
  }
);

export const submitTest = createAsyncThunk(
  'test/submit',
  async (attempt: Omit<TestAttempt, 'id' | 'completedAt'>) => {
    return await attemptsAPI.submitAttempt(attempt);
  }
);

const initialState: TestState = {
  tests: [],
  currentTest: null,
  currentAttempt: null,
  loading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    clearCurrentTest: (state) => {
      state.currentTest = null;
      state.currentAttempt = null;
    },
    updateAttempt: (state, action: PayloadAction<Partial<TestAttempt>>) => {
      if (state.currentAttempt) {
        state.currentAttempt = { ...state.currentAttempt, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tests';
      })
      .addCase(startTest.fulfilled, (state, action) => {
        state.currentTest = action.payload;
        state.currentAttempt = {
          id: '',
          userId: '',
          testId: action.payload.id,
          answers: {},
          score: 0,
          totalPoints: action.payload.totalPoints,
          percentage: 0,
          category: 'Beginner',
          timeSpent: 0,
          tabSwitchCount: 0,
          completedAt: '',
          isCompleted: false,
        };
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
      });
  },
});

export const { clearCurrentTest, updateAttempt } = testSlice.actions;
export default testSlice.reducer;