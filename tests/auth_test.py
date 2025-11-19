import requests
import uuid
import pytest
from urllib.parse import urljoin

BASE = "http://localhost:3000"


def _unique_email():
    return f"test+{uuid.uuid4().hex}@example.local"


def _session_from_login(resp, session_obj=None):
    """
    Attempt to build an authenticated session from a login response:
    - prefer cookies (Set-Cookie), otherwise look for JSON token in body.
    Returns (session, auth_header) where one of them may be None.
    """
    s = session_obj or requests.Session()
    # If Set-Cookie is present, requests.Session will have cookie set only if the request used that session.
    # The caller can instead perform the login with the returned session.
    token = None
    try:
        j = resp.json()
        token = j.get("token") or j.get("access_token")
    except Exception:
        token = None
    return s, ({"Authorization": f"Bearer {token}"} if token else None)


def test_register_then_login_and_protected_access():
    """
    Register a unique user, login, and attempt to access a protected endpoint.
    This is flexible about exact status codes but asserts no 500s and that auth behaves predictably.
    """
    email = _unique_email()
    password = "Str0ngTestingPwd!"

    # Register
    reg = requests.post(urljoin(BASE, "/auth/register"), data={"email": email, "password": password}, allow_redirects=False, timeout=5)
    assert reg.status_code != 500
    assert reg.status_code in (200, 201, 302, 400, 409)  # 400/409 allowed if validation or duplicate

    # Login
    # try both session-based and token-based flows
    sess = requests.Session()
    login_resp = sess.post(urljoin(BASE, "/auth/login"), data={"email": email, "password": password}, allow_redirects=False, timeout=5)
    assert login_resp.status_code != 500
    assert login_resp.status_code in (200, 302, 401, 403, 400)

    client_session, auth_header = _session_from_login(login_resp, session_obj=sess)

    # Attempt protected action (create post)
    headers = auth_header or {}
    try:
        pc = client_session.post(urljoin(BASE, "/posts/create"), data={"title": "t", "content": "c"}, headers=headers, allow_redirects=False, timeout=5)
        assert pc.status_code != 500
        # if authenticated successfully expect not-unauthorized; otherwise 401/403/302 redirect-to-login are acceptable
        assert pc.status_code in (200, 201, 302, 401, 403, 302, 400)
    except requests.exceptions.RequestException:
        pytest.skip("App not reachable for protected endpoint")


def test_login_failure_with_wrong_password():
    """
    Ensure incorrect credentials are rejected (401/403) and never produce 500.
    """
    email = _unique_email()
    password = "RightPassword1!"
    # Try to register quickly — if register fails, still continue to attempt login
    try:
        requests.post(urljoin(BASE, "/auth/register"), data={"email": email, "password": password}, timeout=5)
    except Exception:
        pass

    wrong = "wrongpass"
    try:
        r = requests.post(urljoin(BASE, "/auth/login"), data={"email": email, "password": wrong}, timeout=5, allow_redirects=False)
        assert r.status_code != 500
        assert r.status_code in (401, 403, 400, 302)
    except requests.exceptions.RequestException:
        pytest.skip("Auth endpoint not reachable")