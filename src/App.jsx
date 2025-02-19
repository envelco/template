import "./App.css"
import { AuthProvider } from "@envelco/runtime"
import * as Query from "@tanstack/react-query"
import React from "react"

const queryClient = new Query.QueryClient()
const ENVEL_API_ENDPOINT = import.meta.env.VITE_ENVEL_API_ENDPOINT

function App() {
  return (
    <Query.QueryClientProvider client={queryClient}>
      <AuthProvider
        apiEndpoint={ENVEL_API_ENDPOINT}
        mainAppDomain="https://envelco.co"
      >
        <EnvelApp />
      </AuthProvider>
    </Query.QueryClientProvider>
  )
}

export default App

const EnvelApp = () => {
  return <div>EnvelApp</div>
}
