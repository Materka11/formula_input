import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { autocompleteEndpoint } from "./endpoints";

export interface IToken {
  id?: string;
  name: string;
}

export const useAutocomplete = (
  query: string
): UseQueryResult<IToken[], Error> => {
  return useQuery<IToken[], Error>({
    queryKey: ["autocomplete", query],
    queryFn: async () => {
      const res = await fetch(`${autocompleteEndpoint}?search=${query}`);
      if (!res.ok) {
        throw console.error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!query,
    initialData: [],
  });
};
