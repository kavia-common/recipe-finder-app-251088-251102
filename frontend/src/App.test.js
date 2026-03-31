import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Recipe Finder header", () => {
  render(<App />);
  expect(screen.getByText(/Recipe Finder/i)).toBeInTheDocument();
});
