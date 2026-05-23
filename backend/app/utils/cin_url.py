"""Validation et résolution des URLs CIN (candidature + profil vendeur)."""


def normalize_cin_url(url: str | None) -> str | None:
    if not url:
        return None
    trimmed = url.strip()
    return trimmed if trimmed.startswith("http") else None


def is_valid_cin_url(url: str | None) -> bool:
    return normalize_cin_url(url) is not None
