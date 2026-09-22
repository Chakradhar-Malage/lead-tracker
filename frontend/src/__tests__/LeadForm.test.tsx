import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadForm } from "../components/LeadForm";

describe("LeadForm", () => {
  it("shows validation errors and does not submit when fields are blank", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LeadForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /save lead/i }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid email address", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LeadForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/phone/i), "555-1234");
    await user.click(screen.getByRole("button", { name: /save lead/i }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values when the form is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LeadForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "  Jane Doe  ");
    await user.type(screen.getByLabelText(/email/i), " jane@example.com ");
    await user.type(screen.getByLabelText(/phone/i), " 555-1234 ");
    await user.click(screen.getByRole("button", { name: /save lead/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "555-1234",
      }),
    );
  });

  it("surfaces a server-side error without crashing", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Email already exists"));
    const user = userEvent.setup();
    render(<LeadForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/phone/i), "555-1234");
    await user.click(screen.getByRole("button", { name: /save lead/i }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });
});
