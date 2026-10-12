import { Trans } from "react-i18next";

/** Renders a translation that may contain <gold>…</gold> and <br/> tags. */
export function Rich({ k, ns = "home", goldClassName = "" }: { k: string; ns?: string; goldClassName?: string }) {
  return (
    <Trans
      ns={ns}
      i18nKey={k}
      components={{
        gold: <em className={`text-gold font-normal ${goldClassName}`} />,
        br: <br />,
      }}
    />
  );
}
