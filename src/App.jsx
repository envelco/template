import "./App.css"
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import React from "react"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

export default App

const ENVEL_API_ENDPOINT = "http://localhost:4000"

// Insert code below this line
