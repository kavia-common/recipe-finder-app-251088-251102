import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Recipe Finder header", () => {
  render(<App />);

  // Use a role-based query to avoid ambiguity with other "Recipe Finder" text (e.g., footer).
  expect(screen.getByRole("heading", { name: /recipe finder/i, level: 1 })).toBeInTheDocument();
});
