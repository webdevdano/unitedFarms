import { fireEvent, render, screen } from "@testing-library/react";
import LoginPage from "../app/login/page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signInMock = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    signInMock.mockReset();
  });

  it("shows error when signIn fails", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin" });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates home on success", async () => {
    signInMock.mockResolvedValue({ ok: true });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "ok" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for navigation call
    await screen.findByText(/demo: use any email/i);
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
