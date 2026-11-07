//! Pocket Camera's Erase: PhotoCraft's Content-Aware Fill (storytold/photocraft, `photocraft_algo::content_aware`,
//! MIT OR Apache-2.0; camera/pocket-algo.LICENSE.txt), patch-based completion from the pixels round what is painted
//! over. Plain exports over the module's own memory: the page writes the picture (RGBA, 8 bits a channel) and the mask
//! (a byte a pixel) into buffers it asks for with `alloc`, calls `erase`, reads the picture back and frees both.

use photocraft_algo::content_aware::{FillOptions, auto_sampling, fill};

/// A buffer of `n` bytes in the module's memory, for the page to write into.
#[unsafe(no_mangle)]
pub extern "C" fn alloc(n: usize) -> *mut u8 {
    let mut v = Vec::<u8>::with_capacity(n);
    let p = v.as_mut_ptr();
    std::mem::forget(v);
    p
}

/// Frees a buffer `alloc` gave.
///
/// # Safety
/// `p` must come from `alloc(n)` with the same `n`, and be freed once.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn dealloc(p: *mut u8, n: usize) {
    drop(unsafe { Vec::from_raw_parts(p, 0, n) });
}

/// Fills the pixels of a w×h RGBA picture where the mask is over 127 from the picture round them, in place (alpha
/// untouched). Returns how many pixels were filled.
///
/// # Safety
/// `rgba` must hold w×h×4 bytes and `mask` w×h, both from `alloc`.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn erase(rgba: *mut u8, w: usize, h: usize, mask: *const u8) -> usize {
    let px = unsafe { std::slice::from_raw_parts_mut(rgba, w * h * 4) };
    let hole: Vec<bool> = unsafe { std::slice::from_raw_parts(mask, w * h) }.iter().map(|&v| v > 127).collect();
    let holes = hole.iter().filter(|&&b| b).count();
    if holes == 0 {
        return 0;
    }
    let img: Vec<f32> = px.chunks_exact(4).flat_map(|p| [p[0] as f32 / 255.0, p[1] as f32 / 255.0, p[2] as f32 / 255.0]).collect();
    let source = auto_sampling(w, h, 3, &img, &hole);
    let out = fill(w, h, 3, &img, &hole, &source, &FillOptions::default());
    for (i, filled) in hole.iter().enumerate() {
        if *filled {
            for c in 0..3 {
                px[i * 4 + c] = (out[i * 3 + c].clamp(0.0, 1.0) * 255.0 + 0.5) as u8;
            }
        }
    }
    holes
}
