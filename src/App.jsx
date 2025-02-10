import "./App.css"
import * as Query from "@tanstack/react-query"
import React from "react"

const queryClient = new Query.QueryClient()
const ENVEL_API_ENDPOINT = import.meta.env.VITE_ENVEL_API_ENDPOINT

function App() {
  return (
    <Query.QueryClientProvider client={queryClient}>
      <EnvelApp />
    </Query.QueryClientProvider>
  )
}

export default App
