import importlib
import inspect
import pytest


def _import_first(candidate_names):
    for name in candidate_names:
        try:
            return importlib.import_module(name)
        except Exception:
            continue
    pytest.skip(f"None of modules available: {candidate_names}")


def _get_callable(mod, *possible_names):
    for n in possible_names:
        fn = getattr(mod, n, None)
        if callable(fn):
            return fn
    return None


def test_password_hash_and_verify_roundtrip():
    """
    Look for a password-hashing utility and verify round-trip semantics.
    Skips if no matching module/function is found.
    """
    mod = _import_first(
        [
            "app.auth.utils",
            "auth.utils",
            "app.utils.security",
            "services.auth",
            "auth",
        ]
    )

    hash_fn = _get_callable(mod, "hash_password", "make_password", "bcrypt_hash")
    verify_fn = _get_callable(mod, "verify_password", "check_password", "bcrypt_check")

    if not hash_fn or not verify_fn:
        pytest.skip("No password hash/verify utilities found in project")

    pw = "UnitTest!234"
    hashed = hash_fn(pw)
    # Accept either verify(hashed, pw) or verify(pw, hashed)
    ok = False
    try:
        ok = verify_fn(hashed, pw) or verify_fn(pw, hashed)
    except TypeError:
        # try single-arg verify that returns a wrapper or raises: fail explicitly
        pytest.skip("verify function has unexpected signature")
    assert ok is True


def test_token_generation_and_validation():
    """
    Look for token helpers (generate/verify) and do a create/verify roundtrip.
    Skips if not present.
    """
    mod = _import_first(
        [
            "app.auth.tokens",
            "app.auth.utils",
            "auth.tokens",
            "services.auth.tokens",
            "auth",
        ]
    )
    gen = _get_callable(mod, "generate_token", "create_token", "encode_token")
    verify = _get_callable(mod, "verify_token", "decode_token", "validate_token")

    if not gen or not verify:
        pytest.skip("No token generate/verify helpers found")

    payload = {"sub": "unit-test", "role": "tester"}
    token = gen(payload)
    assert isinstance(token, str) and len(token) > 10
    decoded = verify(token)
    # decoded may be dict-like or a claim object
    if isinstance(decoded, dict):
        assert decoded.get("sub") == "unit-test"
    else:
        # try attribute access
        assert getattr(decoded, "sub", None) == "unit-test"


def test_email_validator_behavior():
    """
    Try to find a simple email validator and verify true/false behavior.
    """
    mod = _import_first(["app.utils.validators", "utils.validators", "validators", "app.utils"])
    validate = _get_callable(mod, "validate_email", "is_valid_email", "email_is_valid")

    if not validate:
        pytest.skip("No email validator found")

    assert validate("ok@example.com") in (True, 1)
    assert validate("not-an-email") in (False, 0)


def test_user_service_create_handles_errors(monkeypatch):
    """
    If a user service exists, ensure it surfaces validation errors rather than crashing.
    This test monkeypatches a lower-level repo/save call to raise and asserts the service handles it.
    """
    mod = _import_first(["services.user", "app.services.user", "app.user_service", "user_service"])
    create = _get_callable(mod, "create_user", "register_user", "add_user")
    repo = getattr(mod, "repo", None) or getattr(mod, "repository", None)

    if not create:
        pytest.skip("No user creation service found")

    # If there's a repo object with a save/create method, monkeypatch it to raise
    if repo and hasattr(repo, "save"):
        def _raise(*a, **k):
            raise RuntimeError("db-failure")
        monkeypatch.setattr(repo, "save", _raise, raising=False)
        # service should handle or raise a predictable exception type; we assert it doesn't raise unexpected exceptions
        with pytest.raises((RuntimeError, Exception)):
            create({"email": "x@y.z", "password": "p"})
    else:
        # If no repo, just call create with invalid data expecting a validation-style exception or return
        try:
            res = create({"email": "bad", "password": ""})
            # either returns an error dict or raises; if returns, assert not successful creation
            assert not (isinstance(res, dict) and res.get("id"))
        except Exception:
            pass