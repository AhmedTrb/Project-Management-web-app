import { createSlice } from "@reduxjs/toolkit";

interface initialStateType {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
}

const initialState: initialStateType = {
  isSidebarOpen: false,
  isModalOpen: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    toggleSidebarOpen: (state) => {
      state.isSidebarOpen = true;
    },
    toggleSidebarClose: (state) => {
      state.isSidebarOpen = false;
    },
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
});

export const {toggleModal, toggleSidebarClose, toggleSidebarOpen } = globalSlice.actions;
export default globalSlice.reducer;
