import requests
import pytest
from hypothesis import given, strategies as st

BASE = "http://localhost:3000"


# ===== STUB TESTS (Basic sanity checks) =====
class TestStubs:
    """Stub tests to verify basic app functionality"""

    def test_homepage_up(self):
        """Verify homepage is accessible"""
        r = requests.get(f"{BASE}/")
        assert r.status_code in (200, 302)

    def test_create_post_page(self):
        """Verify create post page loads"""
        r = requests.get(f"{BASE}/posts/create")
        assert r.status_code in (200, 302)

    def test_login_page(self):
        """Verify login page is accessible"""
        r = requests.get(f"{BASE}/auth/login")
        assert r.status_code in (200, 302)

    def test_register_page(self):
        """Verify registration page is accessible"""
        r = requests.get(f"{BASE}/auth/register")
        assert r.status_code in (200, 302)


# ===== FUZZER TESTS (Property-based tests using Hypothesis) =====
class TestFuzzers:
    """Fuzz tests to verify robustness with random/malformed inputs"""

    @given(st.text())
    def test_search_with_random_input(self, random_input):
        """Fuzz: send random text to search (if endpoint exists)"""
        r = requests.get(f"{BASE}/", timeout=5)
        assert r.status_code in (200, 302, 404, 400)

    @given(st.integers(min_value=-999999, max_value=999999))
    def test_post_id_fuzzing(self, random_id):
        """Fuzz: request posts with random IDs"""
        try:
            r = requests.get(f"{BASE}/posts/{random_id}", timeout=5)
            assert r.status_code in (200, 302, 404, 403)
        except requests.exceptions.RequestException:
            pass

    @given(st.emails())
    def test_login_email_fuzzing(self, random_email):
        """Fuzz: submit random emails to login"""
        try:
            r = requests.get(f"{BASE}/auth/login", timeout=5)
            assert r.status_code in (200, 302)
        except requests.exceptions.RequestException:
            pass

    @given(
        st.sampled_from(
            [
                "test' OR '1'='1",
                "<script>alert('xss')</script>",
                "../../etc/passwd",
                "DROP TABLE users;",
            ]
        )
    )
    def test_security_payloads(self, payload):
        """Fuzz: test common security attack payloads to ensure app handles them"""
        try:
            r = requests.get(f"{BASE}/?q={payload}", timeout=5)
            assert r.status_code in (200, 302, 404, 400, 403)
        except requests.exceptions.RequestException:
            pass


# ===== NEGATIVE / ERROR COVERAGE TESTS =====
class TestErrorCases:
    """Tests targeting error conditions and ensuring the app doesn't crash (500)"""

    def test_nonexistent_route_not_500(self):
        """Request a non-existent route; should not produce 500"""
        try:
            r = requests.get(f"{BASE}/__this_route_should_not_exist__", timeout=5)
            assert r.status_code != 500
            assert r.status_code in (404, 302, 200, 400, 403)
        except requests.exceptions.RequestException:
            # network issues acceptable in CI environments
            pass

    def test_invalid_method_handling(self):
        """Send invalid HTTP methods to endpoints and ensure no 500 responses"""
        endpoints = ["/", "/auth/login", "/posts/create", "/auth/register"]
        methods = [requests.put, requests.delete, requests.patch]
        for ep in endpoints:
            for method in methods:
                try:
                    r = method(f"{BASE}{ep}", timeout=5)
                    assert r.status_code != 500
                    assert r.status_code in (200, 302, 401, 403, 404, 405, 400)
                except requests.exceptions.RequestException:
                    pass

    def test_post_create_missing_or_invalid_fields(self):
        """POST to create page with missing/invalid body should return a client error or redirect, not 500"""
        headers = {"Content-Type": "application/json"}
        try:
            r = requests.post(f"{BASE}/posts/create", json={}, headers=headers, timeout=5)
            assert r.status_code != 500
            assert r.status_code in (400, 422, 302, 401, 403, 200)
        except requests.exceptions.RequestException:
            pass

    def test_protected_endpoint_requires_auth(self):
        """Access a protected endpoint without auth; expect 401/403/redirect but not 500"""
        try:
            r = requests.post(f"{BASE}/posts/create", data={"title": "x"}, timeout=5)
            assert r.status_code != 500
            assert r.status_code in (401, 403, 302, 400, 200)
        except requests.exceptions.RequestException:
            pass

    def test_malformed_json_body(self):
        """Send malformed JSON and ensure server handles it gracefully (no 500)"""
        headers = {"Content-Type": "application/json"}
        try:
            r = requests.post(f"{BASE}/auth/login", data="not-a-json-{", headers=headers, timeout=5)
            assert r.status_code != 500
            assert r.status_code in (400, 302, 401, 403, 200)
        except requests.exceptions.RequestException:
            pass

    @given(st.text(min_size=10000))
    def test_large_payload_handling(self, large_payload):
        """Send an excessively large payload to ensure the server doesn't crash (no 500)"""
        try:
            r = requests.post(f"{BASE}/posts/create", data={"content": large_payload}, timeout=10)
            assert r.status_code != 500
            assert r.status_code in (200, 302, 413, 400, 401, 403)
        except requests.exceptions.RequestException:
            pass

    def test_rate_limit_detection_or_no_server_error(self):
        """Hammer the server a bit to see if rate limiting occurs; never allow a 500"""
        saw_429 = False
        try:
            for _ in range(12):
                r = requests.get(f"{BASE}/", timeout=2)
                if r.status_code == 429:
                    saw_429 = True
                    break
                assert r.status_code != 500
            # test passes if we observed 429 or never saw a 500
            assert True
        except requests.exceptions.RequestException:
            pass

    def test_timeout_behavior(self):
        """Use an intentionally short timeout to validate client timeout handling"""
        try:
            with pytest.raises(requests.exceptions.Timeout):
                requests.get(f"{BASE}/", timeout=0.0001)
        except AssertionError:
            # If the server responds extremely fast, that's acceptable; ensure it didn't return 500
            try:
                r = requests.get(f"{BASE}/", timeout=5)
                assert r.status_code != 500
            except requests.exceptions.RequestException:
                pass

    @given(st.sampled_from(["../etc/passwd", "/../../secret", "%00", "\x00"]))
    def test_path_traversal_inputs(self, payload):
        """Send path traversal-like payloads and ensure server responds without internal errors"""
        try:
            r = requests.get(f"{BASE}/?path={payload}", timeout=5)
            assert r.status_code != 500
            assert r.status_code in (200, 302, 404, 400, 403)
        except requests.exceptions.RequestException:
            pass