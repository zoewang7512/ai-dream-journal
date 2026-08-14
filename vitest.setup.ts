import "@testing-library/jest-dom/vitest";

/**
 * jsdom doesn't implement these — Radix UI primitives (Select/Dialog/Toast)
 * call them internally for positioning and pointer capture.
 */
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!window.HTMLElement.prototype.releasePointerCapture) {
  window.HTMLElement.prototype.releasePointerCapture = () => {};
}
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/**
 * This project's jsdom version doesn't implement Blob/File.prototype.text()
 * (used by the backup-import flow to read an uploaded File). FileReader is
 * implemented, so polyfill text() on top of it.
 */
if (!window.Blob.prototype.text) {
  window.Blob.prototype.text = function (this: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}
