# Living world layer

The optional `living.css` layer adds three restrained water glints, three distant birds, slow foreground mist and occasional small leaf drifts. Placement is specific to each painted scene: beach water is on the left, wreck water is at the left edge, and camp water is in the distant gap. The wreck hides leaves. Nothing moves the painting or hull. The layer is pointer-transparent and below actors and interaction targets.

Integration requires an `aria-hidden="true"` `.world-life` element inside `.scene`, with three empty `.sea-glint`, three `.sky-bird` and three `.leaf-drift` spans in that order. Link `living.css` after the existing scene styles. The global reduced-motion setting and the operating-system preference stop these animations; the host may additionally pause them when the document is hidden.

Reviewed the three supplied backgrounds for placement. Final visual and responsive testing must occur after host integration; this file does not assert that testing happened.
