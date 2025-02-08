import { Task } from "@/app/types/types";
import { createSlice } from "@reduxjs/toolkit";
import { clear } from "console";

interface initialStateType {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  isTaskDetailsModalOpen: boolean;
  task: Task | null;
}

const initialState: initialStateType = {
  isSidebarOpen: false,
  isModalOpen: false,
  isTaskDetailsModalOpen: false,
  task: null,
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
    toggleTaskDetailsModalOpen: (state) => {
      state.isTaskDetailsModalOpen = true ;
    },
    toggleTaskDetailsModalClose: (state) => {
      state.isTaskDetailsModalOpen = false;
    },
    setSelectedTask: (state, action) => {
      state.task = action.payload;
    },
    clearTask: (state) => {
      state.task = null;
    }
  },
});

export const {toggleModal, toggleSidebarClose, toggleSidebarOpen, toggleTaskDetailsModalOpen, toggleTaskDetailsModalClose,setSelectedTask, clearTask } = globalSlice.actions;
export default globalSlice.reducer;
