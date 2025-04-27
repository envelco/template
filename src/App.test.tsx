import * as React from "react"
import { render } from "@testing-library/react"
import App from "./App"

test("does not render an learn angular link", () => {
  const { queryByText } = render(<App />)
  const linkElement = queryByText(/learn angular/i)
  expect(linkElement).not.toBeInTheDocument()
})
