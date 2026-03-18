import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewSelector } from "./ViewSelector";
import type { StructurizrView } from "@c4/c4-parser";

const views: StructurizrView[] = [
  { key: "landscape" },
  { key: "context", description: "System Context" },
  { key: "containers", description: "Container View" },
];

describe("ViewSelector", () => {
  it("renders an option for each view", () => {
    render(
      <ViewSelector views={views} selectedKey="landscape" onChange={vi.fn()} />,
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("displays just the key when view has no description", () => {
    render(
      <ViewSelector views={views} selectedKey="landscape" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("option", { name: "landscape" })).toBeTruthy();
  });

  it("displays key — description when view has a description", () => {
    render(
      <ViewSelector views={views} selectedKey="landscape" onChange={vi.fn()} />,
    );
    expect(
      screen.getByRole("option", { name: "context — System Context" }),
    ).toBeTruthy();
  });

  it("selects the option matching selectedKey", () => {
    render(
      <ViewSelector views={views} selectedKey="context" onChange={vi.fn()} />,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("context");
  });

  it("calls onChange with the new key when selection changes", async () => {
    const onChange = vi.fn();
    render(
      <ViewSelector
        views={views}
        selectedKey="landscape"
        onChange={onChange}
      />,
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "containers");
    expect(onChange).toHaveBeenCalledWith("containers");
  });
});
