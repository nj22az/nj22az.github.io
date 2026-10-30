# Photo shader sources and licensing review

Reviewed before the shader-list extension was written on 30 October 2026. No source line, LUT data or shader asset
was copied from these repositories. These licence checks are a record of the references, not an assertion that
everything inside a repository has one licence. No lygia or Filters4Processing implementation was opened or copied.

| Reference | Primary licence checked | Result / use |
|---|---|---|
| evanw/glfx.js | [LICENSE](https://github.com/evanw/glfx.js/blob/master/LICENSE), blob `d8703df912eff879f9d3fad7ece4a073f3a77009` | MIT, Evan Wallace 2011; notice required for a substantial port. No port made |
| pmndrs/postprocessing | [LICENSE.md](https://github.com/pmndrs/postprocessing/blob/main/LICENSE.md), blob `0dbaabc8f47bb16b8fd827d2fb9cc953bd26c54d` | zlib; origin/alterations must be clear and notice retained. No port made |
| BradLarson/GPUImage3 | [License.txt](https://github.com/BradLarson/GPUImage3/blob/main/License.txt), blob `3cedcf288327c1e89355f35e72d85c1aa94a03fe` | BSD 3-clause style, Brad Larson/Janie Clayton 2018; source/binary notice and no endorsement. No port made |
| cats-oss/android-gpuimage, now wasabeef/android-gpuimage | [README's License section](https://github.com/wasabeef/android-gpuimage/blob/master/README.md#license), blob `dffd063aa1645bcae5c2b8b7c08277b4557ddac8` | **Apache-2.0**, CyberAgent 2018, not the handover's tentative BSD description. Root LICENSE/LICENSE.txt were not readable; README contains the explicit licence. No port made |
| patriciogonzalezvivo/lygia | Excluded by the owner's instruction | No copying, no dependency |
| SableRaf/Filters4Processing | Excluded by the owner's instruction | No copying, no dependency |

Algorithm reference: Kyprianidis, Kang and Döllner, *Image and Video Abstraction by Anisotropic Kuwahara Filtering*
(2009), [author page and paper](https://www.kyprianidis.com/p/pg2009/). Pocket Camera's original implementation
uses an averaged structure tensor, ellipse alignment, eight overlapping analytic Gaussian angular/radial weights
and a low-variance weighted blend. The analytic weights approximate the paper's convolved sector kernels; this is
not a bit-for-bit reproduction of its implementation. LIGHT uses fewer samples across the same reach.

Other implementations here are original: highlight extraction/screen halation, radial lens sampling, recursive
ordered-dither ranks, the authored VGA material ramps, 3D LUT generation/addressing and a bounded bitonic sorting
network. No proprietary film profile or branded LUT is distributed. Existing World helpers are imported as before;
World's shader file is unchanged.
