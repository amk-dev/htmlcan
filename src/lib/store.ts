import { create } from "zustand";

type CanvasStore = {
  focusPageName: string | null;
  setFocusPageName: (name: string | null) => void;
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  focusPageName: null,
  setFocusPageName: (name) => set({ focusPageName: name }),
}));
