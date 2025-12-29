import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAuthenticatedApi, expenseService } from '../services/api';

const initialState = {
  groups: [],
  expenses: [],
  currentGroup: null,
  balances: null,
  settlements: [],
  isLoading: false,
  isCreating: false,
  error: null,
};



// Create expense group
export const createExpenseGroup = createAsyncThunk(
  'expense/createGroup',
  async ({ getToken, groupData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.createExpenseGroup(authApi, groupData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create expense group'
      );
    }
  }
);

// Fetch my expense groups
export const fetchMyExpenseGroups = createAsyncThunk(
  'expense/fetchGroups',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getMyExpenseGroups(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch expense groups'
      );
    }
  }
);

// Fetch expense group by ID
export const fetchExpenseGroupById = createAsyncThunk(
  'expense/fetchGroupById',
  async ({ getToken, id }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getExpenseGroupById(authApi, id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch expense group'
      );
    }
  }
);

// Add members to group
export const addMembersToGroup = createAsyncThunk(
  'expense/addMembers',
  async ({ getToken, groupId, members }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.addMembersToGroup(authApi, groupId, members);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add members'
      );
    }
  }
);

// Delete expense group
export const deleteExpenseGroup = createAsyncThunk(
  'expense/deleteGroup',
  async ({ getToken, groupId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await expenseService.deleteExpenseGroup(authApi, groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete expense group'
      );
    }
  }
);

// Leave expense group
export const leaveExpenseGroup = createAsyncThunk(
  'expense/leaveGroup',
  async ({ getToken, groupId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await expenseService.leaveExpenseGroup(authApi, groupId);
      return groupId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to leave expense group'
      );
    }
  }
);

// Remove member from group
export const removeMemberFromGroup = createAsyncThunk(
  'expense/removeMember',
  async ({ getToken, groupId, memberId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.removeMemberFromGroup(authApi, groupId, memberId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to remove member'
      );
    }
  }
);



// Create expense
export const createExpense = createAsyncThunk(
  'expense/create',
  async ({ getToken, expenseData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.createExpense(authApi, expenseData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create expense'
      );
    }
  }
);

// Fetch my expenses
export const fetchMyExpenses = createAsyncThunk(
  'expense/fetchAll',
  async (getToken, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getMyExpenses(authApi);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch expenses'
      );
    }
  }
);

// Fetch expenses by group
export const fetchExpensesByGroup = createAsyncThunk(
  'expense/fetchByGroup',
  async ({ getToken, groupId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getExpensesByGroup(authApi, groupId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch expenses'
      );
    }
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  'expense/delete',
  async ({ getToken, expenseId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      await expenseService.deleteExpense(authApi, expenseId);
      return expenseId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete expense'
      );
    }
  }
);


// Fetch group balances
export const fetchGroupBalances = createAsyncThunk(
  'expense/fetchBalances',
  async ({ getToken, groupId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getGroupBalances(authApi, groupId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch balances'
      );
    }
  }
);

// Settle up
export const settleUp = createAsyncThunk(
  'expense/settle',
  async ({ getToken, settlementData }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.settleUp(authApi, settlementData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to settle'
      );
    }
  }
);

// Fetch settlement history
export const fetchSettlementHistory = createAsyncThunk(
  'expense/fetchSettlements',
  async ({ getToken, groupId }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.getSettlementHistory(authApi, groupId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch settlements'
      );
    }
  }
);

// Send payment reminder
export const sendPaymentReminder = createAsyncThunk(
  'expense/sendReminder',
  async ({ getToken, recipientId, amount, groupName }, { rejectWithValue }) => {
    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await expenseService.sendPaymentReminder(authApi, {
        recipientId,
        amount,
        groupName,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send reminder'
      );
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
      state.balances = null;
    },
    resetExpenseState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Expense Group
      .addCase(createExpenseGroup.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createExpenseGroup.fulfilled, (state, action) => {
        state.isCreating = false;
        state.groups.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createExpenseGroup.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create expense group';
      })

      // Fetch My Expense Groups
      .addCase(fetchMyExpenseGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyExpenseGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMyExpenseGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch expense groups';
      })

      // Fetch Expense Group By ID
      .addCase(fetchExpenseGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload.data;
        state.error = null;
      })
      .addCase(fetchExpenseGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch expense group';
      })

      // Add Members To Group
      .addCase(addMembersToGroup.fulfilled, (state, action) => {
        const updatedGroup = action.payload.data;
        const index = state.groups.findIndex(g => g._id === updatedGroup._id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
        if (state.currentGroup?._id === updatedGroup._id) {
          state.currentGroup = updatedGroup;
        }
      })

      // Delete Expense Group
      .addCase(deleteExpenseGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })

      // Leave Expense Group
      .addCase(leaveExpenseGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })

      // Remove Member From Group
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        const updatedGroup = action.payload.data;
        const index = state.groups.findIndex(g => g._id === updatedGroup._id);
        if (index !== -1) {
          state.groups[index] = updatedGroup;
        }
        if (state.currentGroup?._id === updatedGroup._id) {
          state.currentGroup = updatedGroup;
        }
      })

      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isCreating = false;
        state.expenses.unshift(action.payload.data);
        // Update group total if it exists in our groups list
        const groupId = action.payload.data.groupId;
        const groupIndex = state.groups.findIndex(g => g._id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].totalExpenses += action.payload.data.amount;
        }
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create expense';
      })

      // Fetch My Expenses
      .addCase(fetchMyExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMyExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch expenses';
      })

      // Fetch Expenses By Group
      .addCase(fetchExpensesByGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpensesByGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchExpensesByGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch expenses';
      })

      // Delete Expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const deletedExpense = state.expenses.find(e => e._id === action.payload);
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
        // Update group total if applicable
        if (deletedExpense) {
          const groupIndex = state.groups.findIndex(g => g._id === deletedExpense.groupId);
          if (groupIndex !== -1) {
            state.groups[groupIndex].totalExpenses -= deletedExpense.amount;
          }
        }
      })

      // Fetch Group Balances
      .addCase(fetchGroupBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload.data;
        state.error = null;
      })
      .addCase(fetchGroupBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch balances';
      })

      // Settle Up
      .addCase(settleUp.fulfilled, (state, action) => {
        state.settlements.unshift(action.payload.data);
      })

      // Fetch Settlement History
      .addCase(fetchSettlementHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettlementHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settlements = action.payload.data;
        state.error = null;
      })
      .addCase(fetchSettlementHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch settlements';
      });
  },
});

export const { clearError, clearCurrentGroup, resetExpenseState } = expenseSlice.actions;
export default expenseSlice.reducer;
