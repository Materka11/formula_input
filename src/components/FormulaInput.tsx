import { useState, useRef, useEffect, useMemo } from "react";
import { useFormulaStore } from "../stores/formulaStore";
import { useAutocomplete, IToken } from "../lib/endpoints/autocomplete";

export const FormulaInput = () => {
  const {
    formula,
    addToken,
    removeLastToken,
    removeTokenAtIndex,
    insertIndex,
    setInsertIndex,
    calculate,
  } = useFormulaStore();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);
  const suggestionItemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const { data: rawSuggestions, error } = useAutocomplete(inputValue.trim());
  const lastToken = formula.length > 0 ? formula[formula.length - 1] : null;
  const operands = useMemo(() => ["+", "-", "*", "(", ")", "^", "/"], []);
  const isLastTokenOperand =
    lastToken && typeof lastToken === "string" && operands.includes(lastToken);
  const suggestions = useMemo(() => {
    return rawSuggestions
      ? isLastTokenOperand
        ? rawSuggestions.filter((s) => !operands.includes(s.name))
        : rawSuggestions
      : [];
  }, [rawSuggestions, isLastTokenOperand, operands]);

  if (error) {
    console.error("Autocomplete error:", error);
  }

  useEffect(() => {
    setHighlightedIndex(null);
  }, [suggestions]);

  useEffect(() => {
    if (
      highlightedIndex !== null &&
      suggestionItemRefs.current[highlightedIndex]
    ) {
      suggestionItemRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (highlightedIndex !== null && suggestions?.[highlightedIndex]) {
        addToken(
          suggestions[highlightedIndex],
          insertIndex !== null ? insertIndex : undefined
        );
        setInputValue("");
        setInsertIndex(null);
        setHighlightedIndex(null);
      } else {
        addToken(
          inputValue.trim(),
          insertIndex !== null ? insertIndex : undefined
        );
        setInputValue("");
        setInsertIndex(null);
      }
    }
    if (e.key === "Backspace" && inputValue === "") {
      removeLastToken();
      setInsertIndex(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === null || prev === suggestions.length - 1 ? 0 : prev + 1
      );
    }
    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === null || prev === 0 ? suggestions.length - 1 : prev - 1
      );
    }
    if (e.key === "Escape") {
      setHighlightedIndex(null);
      setInputValue("");
    }
  };

  const handleDropdownChange = (index: number, value: string) => {
    if (value === "delete") {
      removeTokenAtIndex(index);
    } else if (value === "edit") {
      const token = formula[index];
      removeTokenAtIndex(index);
      setInputValue(typeof token === "string" ? token : token.name);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const getTokenClass = (token: string | IToken) => {
    const value = typeof token === "string" ? token : token.name;
    return operands.includes(value)
      ? "bg-blue-100 text-blue-800 font-bold"
      : "bg-gray-200 text-gray-800";
  };

  return (
    <div className="border p-4 rounded-lg w-full max-w-lg bg-gray-50 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        {formula.map((token, index) => (
          <div
            key={index}
            className={`flex items-center ${getTokenClass(
              token
            )} px-2 py-1 rounded`}
          >
            <span
              onClick={() => setInsertIndex(index + 1)}
              className="cursor-pointer"
            >
              {typeof token === "string" ? token : token.name}
            </span>
            <select
              className="ml-2 text-sm bg-transparent border-none focus:outline-none"
              onChange={(e) => handleDropdownChange(index, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Options
              </option>
              <option value="edit">Edit</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        ))}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="outline-none border-none flex-1 min-w-[100px] bg-gray-50 text-gray-800 placeholder-gray-400"
            placeholder="Type a formula..."
          />
          {suggestions.length > 0 && (
            <ul
              ref={suggestionListRef}
              className="absolute z-10 border mt-1 p-2 bg-white shadow-lg rounded-lg max-h-40 overflow-y-auto w-40"
            >
              {suggestions.map((suggestion: IToken, idx) => (
                <li
                  key={`${suggestion.id}-${idx}`}
                  ref={(el) => {
                    suggestionItemRefs.current[idx] = el;
                  }}
                  className={`cursor-pointer px-3 py-1 text-sm ${
                    highlightedIndex === idx
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    addToken(
                      suggestion,
                      insertIndex !== null ? insertIndex : undefined
                    );
                    setInputValue("");
                    setInsertIndex(null);
                    setTimeout(() => inputRef.current?.focus(), 0);
                    setHighlightedIndex(null);
                  }}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {formula.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Result: <span className="font-semibold">{calculate()}</span>
        </div>
      )}
    </div>
  );
};
