<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import IconMenu from '~icons/lucide/menu';
import IconX from '~icons/lucide/x';
import IconExternalLink from '~icons/lucide/external-link';

// Mobile nav drawer with focus trap, Escape-key dismiss, and inert-siblings.
// Rendered as an island because it needs client state; the drawer markup is
// always in the DOM so aria-controls has a valid target. The link list is passed
// in from Navbar.astro so it stays defined once (SSR) alongside the desktop links.
type NavLink = { href: string; label: string; external?: boolean };

const props = defineProps<{ links: NavLink[] }>();

const open = ref(false);
const currentPath = ref('');
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
let inertSiblings: HTMLElement[] = [];

// Hide every body sibling (skip-nav, main, footer, consent banner) from AT and
// pointer/focus while the drawer is open. Walk from the drawer up to its
// nearest body-child ancestor (the <nav>) so the nav itself stays operable.
function setSiblingsInert(): void {
  let host: Element | null = menuRef.value;
  while (host && host.parentElement !== document.body) host = host.parentElement;
  if (!host) return;
  inertSiblings = Array.from<HTMLElement>(document.body.children).filter((el) => el !== host);
  inertSiblings.forEach((el) => {
    el.setAttribute("inert", "");
    el.setAttribute("aria-hidden", "true");
  });
}

function clearSiblingsInert(): void {
  inertSiblings.forEach((el) => {
    el.removeAttribute("inert");
    el.removeAttribute("aria-hidden");
  });
  inertSiblings = [];
}

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    closeMenu(true);
    return;
  }
  if (e.key !== "Tab" || !menuRef.value) return;
  const items = focusableIn(menuRef.value);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

async function openMenu(): Promise<void> {
  open.value = true;
  await nextTick();
  setSiblingsInert();
  document.addEventListener("keydown", onKeydown);
  focusableIn(menuRef.value as HTMLElement)[0]?.focus();
}

function closeMenu(restoreFocus = true): void {
  open.value = false;
  document.removeEventListener("keydown", onKeydown);
  clearSiblingsInert();
  if (restoreFocus) triggerRef.value?.focus();
}

function toggle(): void {
  if (open.value) closeMenu(true);
  else void openMenu();
}

// This island is transition:persist, so it is NOT unmounted on client navigation
// (onBeforeUnmount won't fire). Force-close on astro:before-swap so a click on a
// nav-level link that is not a drawer link (e.g. the logo) can't leave the drawer
// open with a live focus trap over the next page. Also close when the viewport
// crosses to >=md, where the drawer is hidden but its trap/inert would persist.
let desktopMq: MediaQueryList | null = null;
function handleBeforeSwap(): void {
  if (open.value) closeMenu(false);
}
function handleAfterSwap(): void {
  currentPath.value = window.location.pathname;
}
function handleBreakpoint(e: MediaQueryListEvent): void {
  if (e.matches && open.value) closeMenu(false);
}

onMounted(() => {
  currentPath.value = window.location.pathname;
  document.addEventListener('astro:after-swap', handleAfterSwap);
  document.addEventListener("astro:before-swap", handleBeforeSwap);
  desktopMq = window.matchMedia("(min-width: 768px)");
  desktopMq.addEventListener("change", handleBreakpoint);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("astro:after-swap", handleAfterSwap);
  document.removeEventListener("astro:before-swap", handleBeforeSwap);
  desktopMq?.removeEventListener("change", handleBreakpoint);
  clearSiblingsInert();
});

// Shared link classes for the mobile drawer nav links.
const linkCls =
  "inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-dim hover:text-foreground dark:hover:text-primary transition-colors rounded px-1.5 -mx-1.5 focus-ring";

function isActive(href: string): boolean {
  if (!currentPath.value) return false;
  return !href.includes('://') && currentPath.value.startsWith(href);
}
</script>

<template>
  <button
    ref="triggerRef"
    type="button"
    class="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-ring"
    aria-label="Menu"
    :aria-expanded="open"
    aria-controls="mobile-menu"
    @click="toggle"
  >
    <IconX v-if="open" width="18" height="18" aria-hidden="true" />
    <IconMenu v-else width="18" height="18" aria-hidden="true" />
  </button>

  <!-- Drawer: always in the DOM so aria-controls resolves. Positioned
       absolute top-full so it sits directly below the fixed <nav> (a fixed
       element is the containing block for its absolute descendants) at full
       width, no magic offset. Plain <div>, not <nav>: it lives inside the outer
       <nav aria-label="Main"> and a nested nav landmark would create two
       overlapping navigation regions. -->
  <div
    id="mobile-menu"
    ref="menuRef"
    :hidden="!open"
    :class="[
      'absolute inset-x-0 top-full z-40 border-b border-border bg-background px-6 py-2 md:hidden',
      open ? 'flex flex-col gap-1' : '',
    ]"
  >
    <ul role="list" class="contents">
      <li v-for="l in props.links" :key="l.href" class="contents">
        <a
          v-if="l.external"
          :href="l.href"
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby="new-tab-hint"
          :class="linkCls"
          @click="closeMenu(false)"
        >
          {{ l.label }} <IconExternalLink width="12" height="12" aria-hidden="true" />
        </a>
        <a
          v-else
          :href="l.href"
          :class="[linkCls, isActive(l.href) ? 'font-semibold text-foreground' : '']"
          :aria-current="isActive(l.href) ? 'page' : undefined"
          @click="closeMenu(false)"
        >
          {{ l.label }}
        </a>
      </li>
    </ul>
  </div>
</template>
