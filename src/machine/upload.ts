import { createMachine } from "xstate";

export const uploadMachine = createMachine({
  id: "upload",
  initial: "idle",
  states: {
    idle: {
      on: {
        UPLOAD: { target: "uploading" },
      },
    },
    uploading: {
      on: {
        SUCCESS: { target: "success" },
        FAIL: { target: "fail" },
      },
    },
    success: {
      on: {
        RESET: { target: "idle" },
      },
    },
    fail: {
      on: {
        RESET: { target: "idle" },
      },
    },
  },
});
