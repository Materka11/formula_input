import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { FormulaInput } from "./components/FormulaInput";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex justify-center items-center min-h-screen">
        <FormulaInput />
      </main>
    </QueryClientProvider>
  );
}

export default App;
