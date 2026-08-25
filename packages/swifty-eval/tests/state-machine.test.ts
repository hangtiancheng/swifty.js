import { describe, expect, it } from "vitest";
import { DialogueStateMachine } from "@/engine/state-machine.js";

describe("DialogueStateMachine", () => {
  it("starts in the start state", () => {
    expect(new DialogueStateMachine().currentState).toBe("start");
  });

  it("follows a valid transition path to a terminal state", () => {
    const machine = new DialogueStateMachine();
    expect(machine.transition("identityCheck")).toBe(true);
    expect(machine.transition("flowExecution")).toBe(true);
    expect(machine.transition("userRefusal")).toBe(true);
    expect(machine.transition("end")).toBe(true);
    expect(machine.isTerminal()).toBe(true);
    expect(machine.stateHistory).toEqual([
      "start",
      "identityCheck",
      "flowExecution",
      "userRefusal",
    ]);
  });

  it("rejects invalid transitions without changing state", () => {
    const machine = new DialogueStateMachine();
    expect(machine.transition("end")).toBe(false);
    expect(machine.currentState).toBe("start");
  });

  it("allows flowExecution to loop on itself", () => {
    const machine = new DialogueStateMachine();
    machine.transition("flowExecution");
    expect(machine.transition("flowExecution")).toBe(true);
  });

  it("tracks completed steps and completion ratio", () => {
    const machine = new DialogueStateMachine();
    machine.markStepCompleted(1);
    machine.markStepCompleted(3);
    expect(machine.getCompletedSteps()).toEqual(new Set([1, 3]));
    expect(machine.getCompletionRatio(4)).toBe(0.5);
    expect(machine.getCompletionRatio(0)).toBe(1);
  });

  it("resets to the initial state", () => {
    const machine = new DialogueStateMachine();
    machine.transition("identityCheck");
    machine.markStepCompleted(1);
    machine.reset();
    expect(machine.currentState).toBe("start");
    expect(machine.getCompletedSteps().size).toBe(0);
    expect(machine.stateHistory).toEqual([]);
  });
});
