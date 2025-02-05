import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/app/types/types"; // Make sure you have the User type defined

interface authState {
    user: User | null;
    token: string | null ;
}

const initialState: authState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token; 
        },
        logOut: (state) => {
            state.user = null;
            state.token = null; 
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;

// Selectors for getting the current user and token from state
export const selectCurrentUser = (state: { auth: authState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: authState }) => state.auth.token;

export default authSlice.reducer;
