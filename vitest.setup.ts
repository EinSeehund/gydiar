import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Pin the test clock's timezone so date-fns functions like startOfToday(),
// which resolve against the local timezone, don't depend on the host machine's offset.
process.env.TZ = "UTC";

afterEach(cleanup);
