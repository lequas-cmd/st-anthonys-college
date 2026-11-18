import React from "react";

type Props = {
  title: string;
  description: string;
};

/**
 * Interim placeholder for tabs that are built after Home is approved.
 * It uses the shared panel styles so the layout stays consistent.
 */
export default function PendingPage({ title, description }: Props) {
  return (
    <section className="sa-panel sa-st-flush" aria-labelledby="pending-h">
      <div className="sa-panel-heading sa-st-padded">
        <div>
          <h3 id="pending-h">{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <p className="sa-st-empty">
        This page is next in the build. Home and the shared student layout are ready for review.
      </p>
    </section>
  );
}
