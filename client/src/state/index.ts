import { createSlice } from "@reduxjs/toolkit";

interface initialStateType {
  isSidebarCollapsed: boolean;
  isModalOpen: boolean;
}

const initialState: initialStateType = {
  isSidebarCollapsed: false,
  isModalOpen: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
});

export const { toggleSidebar, toggleModal } = globalSlice.actions;
export default globalSlice.reducer;
