import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ─── Custom Metrics ───────────────────────────────────────────────
const errorRate = new Rate("errors");
const healthDuration = new Trend("health_duration", true);
const authDuration = new Trend("auth_duration", true);
const listDocsDuration = new Trend("list_docs_duration", true);
const listQuizzesDuration = new Trend("list_quizzes_duration", true);
const totalRequests = new Counter("total_requests");

// ─── Configuration ────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://127.0.0.1:8000";

// Load test stages — ramp up, sustain, ramp down
export const options = {
  stages: [
    { duration: "15s", target: 10 },   // warm up to 10 users
    { duration: "30s", target: 20 },   // ramp up to 20 users
    { duration: "30s", target: 20 },   // sustain 20 users
    { duration: "15s", target: 50 },   // spike to 50 users
    { duration: "20s", target: 50 },   // sustain spike
    { duration: "10s", target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],  // 95% of requests < 2s
    errors: ["rate<0.1"],               // error rate < 10%
    health_duration: ["p(99)<500"],     // health check < 500ms at p99
  },
};

// ─── Test user credentials ────────────────────────────────────────
const TEST_EMAIL = __ENV.TEST_EMAIL || "loadtest@example.com";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "LoadTest123!";

// ─── Helper: make authenticated request ───────────────────────────
function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

// ─── Setup: register test user once ───────────────────────────────
export function setup() {
  console.log(`🎯 Load testing: ${BASE_URL}`);
  console.log(`📧 Test user: ${TEST_EMAIL}`);

  // Try to register
  const regRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      full_name: "Load Tester",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  let token = null;

  if (regRes.status === 201) {
    token = regRes.json("access_token");
    console.log("✅ Test user registered");
  } else {
    // User already exists, login instead
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      `username=${TEST_EMAIL}&password=${TEST_PASSWORD}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (loginRes.status === 200) {
      token = loginRes.json("access_token");
      console.log("✅ Logged in with existing test user");
    } else {
      console.error(`❌ Login failed: ${loginRes.status} ${loginRes.body}`);
    }
  }

  return { token };
}

// ─── Main test function ───────────────────────────────────────────
export default function (data) {
  const token = data.token;

  // ── 1. Health Check (lightweight, high frequency) ──
  group("Health Check", function () {
    const res = http.get(`${BASE_URL}/health`);
    totalRequests.add(1);
    healthDuration.add(res.timings.duration);

    const passed = check(res, {
      "health status 200": (r) => r.status === 200,
      "health body has status ok": (r) => {
        try {
          return r.json("status") === "ok";
        } catch {
          return false;
        }
      },
      "health response < 500ms": (r) => r.timings.duration < 500,
    });
    errorRate.add(!passed);
  });

  sleep(0.5);

  // ── 2. Root endpoint ──
  group("Root Endpoint", function () {
    const res = http.get(`${BASE_URL}/`);
    totalRequests.add(1);

    const passed = check(res, {
      "root status 200": (r) => r.status === 200,
    });
    errorRate.add(!passed);
  });

  sleep(0.3);

  // ── 3. Auth - Get current user (authenticated) ──
  if (token) {
    group("Auth - Get Me", function () {
      const res = http.get(`${BASE_URL}/auth/me`, authHeaders(token));
      totalRequests.add(1);
      authDuration.add(res.timings.duration);

      const passed = check(res, {
        "auth/me status 200": (r) => r.status === 200,
        "auth/me has email": (r) => {
          try {
            return r.json("email") !== undefined;
          } catch {
            return false;
          }
        },
        "auth response < 1s": (r) => r.timings.duration < 1000,
      });
      errorRate.add(!passed);
    });

    sleep(0.5);

    // ── 4. List documents ──
    group("List Documents", function () {
      const res = http.get(`${BASE_URL}/documents`, authHeaders(token));
      totalRequests.add(1);
      listDocsDuration.add(res.timings.duration);

      const passed = check(res, {
        "docs status 200": (r) => r.status === 200,
        "docs is array": (r) => {
          try {
            return Array.isArray(r.json());
          } catch {
            return false;
          }
        },
        "docs response < 1s": (r) => r.timings.duration < 1000,
      });
      errorRate.add(!passed);
    });

    sleep(0.5);

    // ── 5. List quizzes ──
    group("List Quizzes", function () {
      const res = http.get(`${BASE_URL}/quizzes`, authHeaders(token));
      totalRequests.add(1);
      listQuizzesDuration.add(res.timings.duration);

      const passed = check(res, {
        "quizzes status 200": (r) => r.status === 200,
        "quizzes is array": (r) => {
          try {
            return Array.isArray(r.json());
          } catch {
            return false;
          }
        },
        "quizzes response < 1s": (r) => r.timings.duration < 1000,
      });
      errorRate.add(!passed);
    });

    sleep(0.5);

    // ── 6. List flashcards ──
    group("List Flashcards", function () {
      const res = http.get(`${BASE_URL}/flashcards`, authHeaders(token));
      totalRequests.add(1);

      const passed = check(res, {
        "flashcards status 200": (r) => r.status === 200,
        "flashcards response < 1s": (r) => r.timings.duration < 1000,
      });
      errorRate.add(!passed);
    });

    sleep(0.5);

    // ── 7. Progress overview ──
    group("Progress Overview", function () {
      const res = http.get(`${BASE_URL}/progress/overview`, authHeaders(token));
      totalRequests.add(1);

      const passed = check(res, {
        "progress status 200": (r) => r.status === 200,
        "progress response < 1.5s": (r) => r.timings.duration < 1500,
      });
      errorRate.add(!passed);
    });

    sleep(0.3);

    // ── 8. Streak check ──
    group("Streak Check", function () {
      const res = http.get(`${BASE_URL}/progress/streak`, authHeaders(token));
      totalRequests.add(1);

      const passed = check(res, {
        "streak status 200": (r) => r.status === 200,
      });
      errorRate.add(!passed);
    });
  }

  sleep(1);
}

// ─── Teardown: print summary ──────────────────────────────────────
export function teardown(data) {
  console.log("🏁 Load test complete!");
  console.log("📊 Check the k6 output above for detailed metrics.");
}
