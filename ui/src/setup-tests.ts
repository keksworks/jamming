import 'src/extensions/ArrayExtensions'

// not provided by jsdom
Element.prototype.animate = (() => ({cancel: () => {}})) as any
Element.prototype.scrollIntoView = () => {}
window.ResizeObserver = class {observe() {} unobserve() {} disconnect() {}} as any
