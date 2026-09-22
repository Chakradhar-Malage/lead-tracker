import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import type { Lead } from "../api/types";

const { listLeads, createLead, updateLeadStatus } = vi.hoisted(() => ({
  listLeads: vi.fn(),
  createLead: vi.fn(),
  updateLeadStatus: vi.fn(),
}));

vi.mock("../api/leads", async () => {
  const actual = await vi.importActual<typeof import("../api/leads")>(
    "../api/leads",
  );
  return { ...actual, listLeads, createLead, updateLeadStatus };
});

const leads: Lead[] = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@example.com",
    phone: "555-0001",
    status: "NEW",
    created_at: "2026-09-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Bob Jones",
    email: "bob@example.com",
    phone: "555-0002",
    status: "CONTACTED",
    created_at: "2026-09-21T10:00:00Z",
  },
];

beforeEach(() => {
  listLeads.mockReset();
  createLead.mockReset();
  updateLeadStatus.mockReset();
  listLeads.mockResolvedValue(leads);
});

describe("App", () => {
  it("lists leads returned by the API", async () => {
    render(<App />);

    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("2 leads tracked")).toBeInTheDocument();
  });

  it("shows an empty state when there are no leads", async () => {
    listLeads.mockResolvedValue([]);
    render(<App />);

    expect(await screen.findByText("No leads yet")).toBeInTheDocument();
  });

  it("re-queries the API with the search term after typing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Alice Smith");

    await user.type(screen.getByLabelText(/search leads/i), "alice");

    await waitFor(() =>
      expect(listLeads).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "alice" }),
      ),
    );
  });

  it("updates a lead's status and calls the API", async () => {
    updateLeadStatus.mockResolvedValue({ ...leads[0], status: "QUALIFIED" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Alice Smith");

    const select = screen.getByLabelText("Status for Alice Smith");
    await user.selectOptions(select, "Qualified");

    await waitFor(() =>
      expect(updateLeadStatus).toHaveBeenCalledWith("1", "QUALIFIED"),
    );
  });

  it("opens the new lead form and submits a new lead", async () => {
    createLead.mockResolvedValue({
      id: "3",
      name: "Carla Diaz",
      email: "carla@example.com",
      phone: "555-0003",
      status: "NEW",
      created_at: "2026-09-22T10:00:00Z",
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Alice Smith");

    await user.click(screen.getByRole("button", { name: /new lead/i }));
    await user.type(screen.getByLabelText(/name/i), "Carla Diaz");
    await user.type(screen.getByLabelText(/email/i), "carla@example.com");
    await user.type(screen.getByLabelText(/phone/i), "555-0003");
    await user.click(screen.getByRole("button", { name: /save lead/i }));

    expect(await screen.findByText("Carla Diaz")).toBeInTheDocument();
    expect(createLead).toHaveBeenCalledWith({
      name: "Carla Diaz",
      email: "carla@example.com",
      phone: "555-0003",
    });
  });
});
