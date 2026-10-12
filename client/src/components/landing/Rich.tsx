import { Trans } from "react-i18next";

/** Renders a translation that may contain <gold>…</gold> and <br/> tags. */
export function Rich({ k, ns = "home", goldClassName = "" }: { k: string; ns?: string; goldClassName?: string }) {
  return (
    <Trans
      ns={ns}
      i18nKey={k}
      components={{
        // Inline padding widens the gradient-clipped box so italic tails aren't cut; it doesn't move the line.
        gold: <em className={`text-gold -mr-[0.08em] pr-[0.08em] pb-[0.12em] font-normal [box-decoration-break:clone] ${goldClassName}`} />,
        br: <br />,
      }}
    />
  );
}
