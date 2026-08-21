import { useEffect } from "react";

const SORO_SCRIPT_SRC = "https://app.trysoro.com/api/embed/5f4bbb8c-95c3-45c7-8fd4-10e0939d5528";

export function SoroBlogWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SORO_SCRIPT_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = SORO_SCRIPT_SRC;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return <div id="soro-blog" />;
}
