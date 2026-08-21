import { useEffect } from "react";

const SORO_SCRIPT_SRC = "https://app.trysoro.com/api/embed/e8e18fff-c6de-486c-9b59-4a4cc1f1b92d";

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
