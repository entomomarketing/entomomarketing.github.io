Original logo files as supplied. Nothing on the site links to them; they are
kept only as the source of record.

  entomo-ai-source.svg        the entomo.ai lockup      665KB
  entomo-strata-source.svg    the axon wordmark (formerly strata; renamed 2026-08-26 per CMO review)       4.1MB
  entomo-ai-mark-source.png   the standalone "ai" mark  136KB

All three arrived as PNG rasters — the two SVGs are raster embedded in an SVG
wrapper, not vector art. That is why they are the size they are.

What the pages actually use, exported from these at 1200px wide:

  ../entomo-ai.{webp,png}        40KB / 166KB
  ../entomo-strata.{webp,png}    96KB / 337KB
  ../entomo-ai-mark.{webp,png}   35KB / 136KB   (exported, not yet placed)

If true vector versions become available, replace these and re-export. The
hero renders a lockup at up to 540px, so 1200px covers 2x displays.

Two things to know before moving these around:

1. The entomo.ai lockup's "entomo" is near-black and disappears on dark
   backgrounds. Every current placement is on light ground. A light variant
   is needed before any dark-section use.
2. The strata wordmark is all gradient with no dark element, so it reads on
   both light and dark — it is already used on a dark band in the closing
   headline of the strata page.

Aspect ratios differ from the previous versions (the artwork carries more
padding), so the width/height attributes in the markup were updated to match:
entomo.ai is 1200x345, strata is 1200x390. Keep those in sync if you
re-export at a different size, or the page will shift as the image loads.

2026-08-26: strata renamed to AXON (CMO decision). New source:
entomo-axon-source.png (1391x487, white background). Published files
../entomo-axon.{png,webp} were produced by un-compositing the white
background to true alpha (colour-over-white inversion), trimming, and
scaling to 1200x389. Letterform metrics for inline sizing: ink height
74.3% of image, baseline at 91.8% from top (=> 0.875em / -0.072em against
0.65em-ink text). The strata wordmark files were retired with the name.

2026-08-26: entomo.ai wordmark replaced with new artwork supplied as
entomo-ai-source.svg (SVG wrapper around a raster with alpha, 1204.5x258.75
viewBox). Rendered at 2x via headless Chrome (omitBackground), trimmed, and
scaled to 1200x257 -> ../entomo-ai.{png,webp}. Inline sizing recalibrated by
running the same ink-band measurement on old and new art (old reproduced the
shipped 1.384em/-0.128em, validating the method): new letterforms ink 66.2%
of height, baseline on the bottom edge -> .brand-inline img
{ height: 0.976em; vertical-align: 0; }.

2026-08-27: axon wordmark replaced with v4 artwork (entomo-axon-v4-source.png,
1227x645 with alpha, supplied after the CMO called the previous mark
'candy shop'). Trimmed and scaled to 1200x388 -> ../entomo-axon.{png,webp}.
Inline sizing recalibrated by the letterform-band method on old and new:
.brand-inline--axon img { height: 0.882em; vertical-align: -0.139em; }.
