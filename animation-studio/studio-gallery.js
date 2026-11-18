import PhotoSwipeLightbox from '/assets/vendor/photoswipe/photoswipe-lightbox.esm.min.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lightbox = new PhotoSwipeLightbox({
  gallery: '[data-studio-gallery]',
  children: 'a[data-pswp-width]',
  pswpModule: () => import('/assets/vendor/photoswipe/photoswipe.esm.min.js'),
  showHideAnimationType: reducedMotion.matches ? 'none' : 'fade',
  wheelToZoom: true
});

lightbox.addFilter('itemData', (item) => {
  if (item.element?.dataset.caption) item.alt = item.element.dataset.caption;
  return item;
});

lightbox.on('uiRegister', () => {
  const { pswp } = lightbox;
  pswp.ui.registerElement({
    name: 'sample-caption',
    order: 9,
    appendTo: 'root',
    onInit: (element) => {
      element.setAttribute('aria-live', 'polite');
      pswp.on('change', () => {
        element.textContent = pswp.currSlide.data.element?.dataset.caption || '';
        element.hidden = !element.textContent;
      });
    }
  });
});

lightbox.init();
