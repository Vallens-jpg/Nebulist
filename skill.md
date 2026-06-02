# ⚡ Frontend UI/UX Engineering Skill & Execution Standards

This document defines the skill and visual execution standards to elevate basic frontend code into a world-class SaaS product interface. The AI must strictly follow the Tailwind CSS v4 utility architecture defined below when writing and styling UI components.

---

## 1. Spatial Arithmetic (Spacing & Padding Systems)
The single biggest mistake in amateur interfaces is a lack of understanding regarding white space. White space is not empty space; it is an active layout element designed to direct the user's focus.

* **Page Canvas:** Never let elements touch the edges of the screen. Apply generous padding boundaries on the main container layout: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10`.
* **Card Anatomy:** The internal padding of an enterprise card component must be a minimum of 24px to 32px to convey a premium, clean layout: `p-6 sm:p-8`.
* **Logical Grouping:** Elements with strong relationships (e.g. nested input fields) must be packed closely together (`space-y-1.5` or `gap-2`), while space between major visual sections must be wide and breathable (`space-y-6` or `gap-8`).

---

## 2. Micro-Typography & Color Contrast
Avoid flat, single-size typography. Elevate visual interest through extreme contrast in sizing and weights to establish a clear information hierarchy instantly.

* **Dark Mode Contrast:** Text on dark backgrounds must use soft charcoal variants, never pure white, to guarantee readability: `text-slate-950` or `text-slate-900`.
* **Secondary Context:** Mute auxiliary metadata (subtitles, secondary labels, helper text) by lowering contrast to `text-slate-500` or `text-slate-600` and sizing down to `text-sm`.
* **Form Labels:** Inputs require micro-sized, bold, uppercase labels with tracked letters to allow rapid scanning: `text-[11px] font-bold text-slate-700 uppercase tracking-widest`.

---

## 3. Component Elevation & Depth (Layering System)
Excellent interfaces create a realistic illusion of physical depth. Avoid boring, flat designs by utilising rich drop shadows and subtle border borders.

* **The Canvas Substrate:** The absolute app background layer must be styled with a very light, neutral background color: `bg-slate-50/60` or `bg-zinc-50`.
* **The Card Component:** Elevated cards must be styled in pure white (`bg-white`) bordered by extremely fine, low-opacity strokes to blend smoothly: `border border-slate-200/50`.
* **SaaS Soft Shadow:** Employ multi-layered, organic shadows to lift card panels away from the background:
  `shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)]`
* **Modal Interlayer:** Popup modals require the highest spatial elevation, backed by rich but controlled shadows: `shadow-xl border border-slate-200`.

---

## 4. Interaction Physics (Form Controls & Input States)
Default browser inputs are highly visually disruptive. Rebuild interactive form controls to be responsive, tactile, and professional.

* **The Input Shell:** Form controls must use comfortable heights, muted background bases, and smooth transition periods:
  `w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400/70 transition-all duration-200 ease-out`
* **The Premium Focus State:** Active inputs must transition to solid white, highlight their bounds with accent brand borders, and cast a subtle external glow:
  `focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/8`
* **Dropzone Excellence:** Drag-and-drop targets must feel tactile and light. Embody thin, dashed boundaries with responsive hover states:
  `border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/5 rounded-xl transition-colors duration-200`

---

## 5. Micro-Animations & Interaction States
A product feels truly alive when it reacts to every single cursor interaction with micro-animations.

* **Button Transitions:** Every button component must animate when hovered over or clicked: `transition-all duration-150 active:scale-[0.98]`.
* **Loading State:** Replace boring raw text with a clean, spinning SVG vector icon: `animate-spin h-4 w-4 text-current`.
* **Component Mounting:** As panels enter the DOM, provide a smooth fade-in-up entrance: `animate-fade-in-up` or standard visual transition classes.