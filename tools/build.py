"""src/ 조각을 합쳐 세 가지 결과물을 만든다.

dist/app.html   — 체험판(Claude Artifact) 게시용: doctype 없는 본문 조각
gas/Index.html  — 구글 Apps Script 웹앱용 전체 문서
docs/index.html — GitHub Pages 체험판용 전체 문서
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
JS_ORDER = ["plan.js", "core.js", "app.js", "v_big5.js", "v_tier12.js", "v_tier3_team.js", "v_admin.js", "sample.js"]


def body() -> str:
    head = (SRC / "head.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    js = "\n".join((SRC / f).read_text(encoding="utf-8") for f in JS_ORDER)
    js = js.replace("</script", "<\\/script")
    return (
        f"{head}<style>\n{css}</style>\n"
        '<div id="root"></div>\n'
        f"<script>\n{js}\nboot();\n</script>\n"
    )


def full(extra_head: str = "") -> str:
    return (
        "<!DOCTYPE html>\n<html lang=\"ko\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
        f"{extra_head}</head>\n<body>\n{body()}</body>\n</html>\n"
    )


def main() -> None:
    (ROOT / "dist").mkdir(exist_ok=True)
    (ROOT / "docs").mkdir(exist_ok=True)
    (ROOT / "dist" / "app.html").write_text(body(), encoding="utf-8")
    (ROOT / "gas" / "Index.html").write_text(full('<base target="_top">\n'), encoding="utf-8")
    (ROOT / "docs" / "index.html").write_text(full(), encoding="utf-8")
    for p in ["dist/app.html", "gas/Index.html", "docs/index.html"]:
        print(p, (ROOT / p).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
