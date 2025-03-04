import { create } from "zustand";
import { IToken } from "../lib/endpoints/autocomplete";
import { evaluate } from "mathjs";

interface IFormulaState {
  formula: (string | IToken)[];
  insertIndex: number | null;
  addToken: (token: string | IToken, index?: number) => void;
  removeLastToken: () => void;
  removeTokenAtIndex: (index: number) => void;
  setInsertIndex: (index: number | null) => void;
  calculate: () => string;
}

export const useFormulaStore = create<IFormulaState>((set, get) => ({
  formula: [],
  insertIndex: null,
  addToken: (token, index) =>
    set((state) => {
      if (index !== undefined && index >= 0 && index <= state.formula.length) {
        return {
          formula: [
            ...state.formula.slice(0, index),
            token,
            ...state.formula.slice(index),
          ],
        };
      }
      return { formula: [...state.formula, token] };
    }),
  removeLastToken: () =>
    set((state) => ({ formula: state.formula.slice(0, -1) })),
  removeTokenAtIndex: (index) =>
    set((state) => ({
      formula: state.formula.filter((_, i) => i !== index),
    })),
  setInsertIndex: (index) => set(() => ({ insertIndex: index })),
  calculate: () => {
    const formula = get()
      .formula.map((token) => (typeof token === "string" ? token : token.name))
      .join(" ");
    if (!formula) return "";
    try {
      //example
      const scope = { x: 5, y: 10 };
      return evaluate(formula, scope).toString();
    } catch (err) {
      return `Error calculating formula: ${err}`;
    }
  },
}));
