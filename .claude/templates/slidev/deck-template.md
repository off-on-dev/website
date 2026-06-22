---
theme: ./offon
layout: cover
title: Presentation Title
colorSchema: dark
themeConfig:
  primary: '#ffc034'
fonts:
  sans: Inter
  display: Syne
  weights: '400,500,600,700'
  provider: none
---

<div class="offon-logo" role="img" aria-label="OffOn" style="margin-bottom: 1.2em;"></div>

# Presentation Title

<p style="font-size: 0.7em; margin-top: 1em;">Subtitle or tagline goes here.</p>
<p style="font-size: 0.52em; margin-top: 0.35em; opacity: 0.7;">DD Month YYYY, Venue</p>

---

<!-- 2: Agenda table -->

<div class="sh">
  <span class="label">Tonight</span>
  <h2>The Agenda</h2>
</div>
<table class="agenda">
  <tr><td>18:00</td><td>Welcome and intro</td><td>10 min</td></tr>
  <tr class="hi"><td>18:10</td><td>First talk, Speaker Name</td><td>25 min + Q&A</td></tr>
  <tr><td>18:40</td><td>Break</td><td>15 min</td></tr>
  <tr class="hi"><td>18:55</td><td>Second talk, Speaker Name</td><td>25 min + Q&A</td></tr>
  <tr><td>19:25</td><td>Networking</td><td>Open-ended</td></tr>
</table>

---

<!-- 3: Bullet rows -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Key point.</strong> Supporting detail goes here.</span></div>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Another point.</strong> Keep bullets tight, one idea each.</span></div>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Third point.</strong> Use speaker notes to expand on sparse content.</span></div>
<div class="brow"><span class="dot">→</span><span class="bt">Plain bullet without bold. Use when the whole line is equally weighted.</span></div>

---

<!-- 4: Two-column split -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<div class="split-even">
  <div>
    <span class="col-label">left column</span>
    <div class="brow"><span class="dot">→</span><span class="bt">Left bullet one</span></div>
    <div class="brow"><span class="dot">→</span><span class="bt">Left bullet two</span></div>
    <div class="brow"><span class="dot">→</span><span class="bt">Left bullet three</span></div>
  </div>
  <div>
    <span class="col-label">right column</span>
    <div class="vrow hi"><h4>Highlighted item</h4><p>Supporting detail or sub-text.</p></div>
    <div class="vrow"><h4>Second item</h4></div>
    <div class="vrow"><h4>Third item</h4></div>
  </div>
</div>

---

<!-- 5: Cards grid -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<div class="g3">
  <div class="card"><h4>Card One</h4><p>Short description. One or two sentences maximum.</p></div>
  <div class="card"><h4>Card Two</h4><p>Short description. One or two sentences maximum.</p></div>
  <div class="card"><h4>Card Three</h4><p>Short description. One or two sentences maximum.</p></div>
</div>

---

<!-- 6: Speaker cards -->

<div class="sh">
  <span class="label">Tonight's Speakers</span>
  <h2>Who's Presenting</h2>
</div>
<div class="g3" style="margin-top: 0.55em;">
  <div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
    <div style="display: flex; gap: 0.65em; align-items: center;">
      <div class="sp-av">AB</div>
      <div class="sp-info">
        <p class="sp-name">Speaker Name</p>
        <p class="sp-talk" style="margin: 0;">Talk Title</p>
      </div>
    </div>
    <p class="sp-bio">One or two sentence bio. Role, affiliation, notable projects or contributions.</p>
  </div>
  <div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
    <div style="display: flex; gap: 0.65em; align-items: center;">
      <div class="sp-av">CD</div>
      <div class="sp-info">
        <p class="sp-name">Speaker Name</p>
        <p class="sp-talk" style="margin: 0;">Talk Title</p>
      </div>
    </div>
    <p class="sp-bio">One or two sentence bio. Role, affiliation, notable projects or contributions.</p>
  </div>
  <div class="speaker-card" style="flex-direction: column; gap: 0.55em;">
    <div style="display: flex; gap: 0.65em; align-items: center;">
      <div class="sp-av">EF</div>
      <div class="sp-info">
        <p class="sp-name">Speaker Name</p>
        <p class="sp-talk" style="margin: 0;">Talk Title</p>
      </div>
    </div>
    <p class="sp-bio">One or two sentence bio. Role, affiliation, notable projects or contributions.</p>
  </div>
</div>

---

<!-- 7: Bullet rows + tech tags -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<p style="font-size: 0.58em; margin: 0 0 0.6em; opacity: 0.75;">Optional intro sentence below the heading.</p>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Key point.</strong> Supporting detail goes here.</span></div>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Another point.</strong> Keep bullets tight, one idea each.</span></div>
<div class="brow"><span class="dot">→</span><span class="bt"><strong>Third point.</strong> Use speaker notes to expand.</span></div>
<div class="tags" style="margin-top: 0.7em;">
  <span class="tag">Tag One</span>
  <span class="tag">Tag Two</span>
  <span class="tag">Tag Three</span>
  <span class="tag">Tag Four</span>
  <span class="tag" style="border-style: dashed; color: #ffc034; border-color: rgba(255,192,52,0.3);">your project?</span>
</div>

---

<!-- 8: Asymmetric split with image -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<div class="split" style="align-items: center;">
  <div>
    <div class="brow"><span class="dot">→</span><span class="bt"><strong>Key point.</strong> Supporting detail goes here.</span></div>
    <div class="brow"><span class="dot">→</span><span class="bt"><strong>Another point.</strong> Use this layout when you have an image or visual on the right.</span></div>
    <div class="brow"><span class="dot">→</span><span class="bt"><strong>Third point.</strong> The left column is slightly wider (1.15fr vs 0.85fr).</span></div>
  </div>
  <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
    <img src="./public/nyx_peek.webp" alt="" aria-hidden="true" style="height: 230px; object-fit: contain; opacity: 0.6;">
  </div>
</div>

---

<!-- 9: Two-column cards -->

<div class="sh">
  <span class="label">Section Label</span>
  <h2>Slide Title</h2>
</div>
<div class="g2">
  <div class="card"><h4>Card One</h4><p>Short description. Use .g2 when you have two equal items to compare or highlight.</p></div>
  <div class="card"><h4>Card Two</h4><p>Short description. Good for quiz topics, format options, or before/after pairs.</p></div>
</div>

---

<!-- 10: Contribute cards -->

<div class="sh">
  <span class="label">Get Involved</span>
  <h2>Every Contribution Counts</h2>
</div>
<p style="font-size: 0.54em; margin-bottom: 0.6em;">You do not need to write code to contribute.</p>
<div class="g4">
  <div class="contrib">
    <span class="ci">💬</span>
    <h4>Category One</h4>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
  </div>
  <div class="contrib">
    <span class="ci">⚡</span>
    <h4>Category Two</h4>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
  </div>
  <div class="contrib">
    <span class="ci">✍️</span>
    <h4>Category Three</h4>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
  </div>
  <div class="contrib">
    <span class="ci">🌍</span>
    <h4>Category Four</h4>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
    <div class="citem"><span class="cdot">→</span><span class="ctext">Action item</span></div>
  </div>
</div>

---

<!-- 11: Board members -->

<div class="sh">
  <span class="label">The Team</span>
  <h2>Board Members</h2>
</div>
<div class="board">
  <div class="person">
    <div class="av"><img src="./public/team/david.webp" alt="David Hirsch"></div>
    <div class="pi">
      <p class="pn">David Hirsch</p>
      <p class="pr">Head of Community and Open Source, Dynatrace.</p>
    </div>
  </div>
  <div class="person">
    <div class="av"><img src="./public/team/katharina.webp" alt="Katharina Sick"></div>
    <div class="pi">
      <p class="pn">Katharina Sick</p>
      <p class="pr">Senior Developer Programs Engineer, Dynatrace.</p>
    </div>
  </div>
  <div class="person">
    <div class="av"><img src="./public/team/kenyatta.webp" alt="Kenyatta Forbes"></div>
    <div class="pi">
      <p class="pn">Kenyatta Forbes</p>
      <p class="pr">Sr Program Manager, Dynatrace.</p>
    </div>
  </div>
  <div class="person">
    <div class="av"><img src="./public/team/sinduri.webp" alt="Sinduri Guntupalli"></div>
    <div class="pi">
      <p class="pn">Sinduri Guntupalli</p>
      <p class="pr">Sr Developer Programs Engineer, Dynatrace.</p>
    </div>
  </div>
  <div class="person tba">
    <div class="av">?</div>
    <div class="pi">
      <p class="pn">To be announced</p>
      <p class="pr">Board seat open</p>
    </div>
  </div>
  <div class="person tba">
    <div class="av">?</div>
    <div class="pi">
      <p class="pn">To be announced</p>
      <p class="pr">Board seat open</p>
    </div>
  </div>
</div>

---
layout: center
---

<div class="offon-logo" role="img" aria-label="OffOn" style="margin: 0 auto 0.8em; width: 180px;"></div>

# Join Us

<p style="font-size: 0.72em; max-width: 26em; margin: 0.3em auto 0.8em; color: #f0ede5;">Attend an event, propose a talk, start a challenge, or just say hello in the community.</p>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2em; margin: 0 auto 0.8em; max-width: 20em;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em;">
    <div style="width: 5.5em; height: 5.5em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
      <img src="./public/qr/offon-dev.png" alt="QR code for offon.dev" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">
    </div>
    <span style="font-size: 0.38em; color: #ffc034;">offon.dev</span>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 0.4em;">
    <div style="width: 5.5em; height: 5.5em; background: var(--card); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
      <img src="./public/qr/community-offon-dev.png" alt="QR code for community.offon.dev" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">
    </div>
    <span style="font-size: 0.38em; color: #ffc034;">community.offon.dev</span>
  </div>
</div>

<div class="link-row">
<a href="https://community.offon.dev" class="pill hi">Join the community</a>
<a href="https://offon.dev" class="pill">offon.dev</a>
<a href="mailto:offondev@gmail.com" class="pill">offondev@gmail.com</a>
</div>
<div class="link-row" style="margin-top: 0.3em;">
<a href="https://bsky.app/profile/off-on-dev.bsky.social" class="pill" style="display:inline-flex;align-items:center;gap:0.35em;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.422 4.308 4.973-4.718 1.142-6.496-2.553-7.078a13.335 13.335 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>@off-on-dev.bsky.social</a>
<a href="https://www.linkedin.com/company/offondev" class="pill" style="display:inline-flex;align-items:center;gap:0.35em;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>offondev</a>
<a href="https://x.com/OffonDev" class="pill" style="display:inline-flex;align-items:center;gap:0.35em;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835-8.16-10.665h5.234l4.26 5.635 5.432-6.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>@OffonDev</a>
</div>
