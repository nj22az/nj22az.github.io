"""Builds the owner's logo as an SVG and as a Remotion component from the traced parts.

    python3 logo_trace.py <the owner's logo image>      (in a scratch folder: writes paths.json and measure.json there)
    python3 logo_build.py <that folder>

The drawing is the owner's (Johansson Animation Studios), traced part by part. By the owner's word, 13 November
2026: the copyright line is not centred under the mark but stands at the bottom right, the sign after the name
("NILS JOHANSSON ©"); the ink is a stamp's, with a slightly uneven edge and a few places where it did not take;
the outer ring is a true circle on the inner ring's centre ("make the circle around fit the logo better so it looks
aligned": as drawn it stood 17 higher than the inner ring); and the hand on the anchor has three fingers and a
thumb, as the fist has (logo_trace.py).
"""
import json, sys, os
L = sys.argv[1]
out = json.load(open(os.path.join(L, 'paths.json'))); m = json.load(open(os.path.join(L, 'measure.json')))
cx, cy = m['cx'], m['cy']
VX, VY, VW, VH = cx - 420, 22, 840, 768                      # the mark's own axis is the middle of the drawing
# the copyright line, as drawn: the sign at x 455..480, the name at x 489..707, on y 741..767.
# Now: the name, then the sign, the whole set against the right edge of the mark's ink (x = 989).
NAME_DX, SIGN_DX = (989 - 25 - 9 - 218) - 489, (989 - 25) - 455
STAMP = '''<filter id="stamp" x="-5%" y="-5%" width="110%" height="110%">
  <!-- the edge of a stamp: not quite a line -->
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="wob"/>
  <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="edge"/>
  <!-- where the ink did not take: small voids, and a few larger thin places -->
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="3" result="fine"/>
  <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -6.1" result="voids"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="11" result="coarse"/>
  <feColorMatrix in="coarse" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 7 0 0 -4.6" result="thin"/>
  <feComposite in="voids" in2="thin" operator="in" result="worn"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="5" result="speck"/>
  <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 14 0 -10.6" result="pins"/>
  <feMerge result="gone"><feMergeNode in="worn"/><feMergeNode in="pins"/></feMerge>
  <feComposite in="edge" in2="gone" operator="out"/>
</filter>'''


def g(name, extra='', fill='currentColor'):
    tr, paths = out[name]
    return f'<g id="{name}" fill="{fill}"{extra}><g transform="scale(0.25)"><g transform="{tr}">{paths}</g></g></g>'


RING = f'<circle id="ring" cx="{cx:.1f}" cy="{cy:.1f}" r="{m["ring_r"]:.1f}" fill="none" stroke="currentColor" stroke-width="{m["ring_w"]:.1f}"/>'
GROUND = 'var(--logo-ground, #fff)'
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VX:.1f} {VY} {VW} {VH}" role="img" aria-label="Johansson Animation Studios">
<title>Johansson Animation Studios</title>
<!-- Traced from the owner's drawing, 13 November 2026 (films/jack-the-ripper/remotion/logo_trace.py, logo_build.py).
     Each part is its own group. The ink is currentColor; the ground behind the sailor and behind the upper lettering
     is the custom property logo-ground (white if unset). The outer ring is a true circle on the inner ring's centre
     ({cx:.1f}, {cy:.1f}). The copyright line stands at the bottom right, the sign after the name. The filter "stamp"
     gives the ink a stamp's uneven edge and voids: take filter="url(#stamp)" off the group "ink" for clean vectors. -->
<defs>{STAMP}</defs>
<g id="ink" filter="url(#stamp)">
{RING}
{g('mark_back', fill=GROUND)}
{g('mark')}
{g('title_back', fill=GROUND)}
{g('title')}
{g('bottom')}
{g('prop_l')}{g('prop_r')}{g('anchor_l')}{g('anchor_r')}
<g id="copyright">{g('copy_name', f' transform="translate({NAME_DX} 0)"')}{g('copy_mark', f' transform="translate({SIGN_DX} 0)"')}</g>
</g>
</svg>'''
open('public/logo.svg', 'w').write(svg)
site = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets', 'images', 'johansson-animation-studios.svg')
open(site, 'w').write(svg)


def gj(name, fill='currentColor'):
    tr, paths = out[name]; paths = paths.replace('"/>', '" />')
    return f'<g fill="{fill}"><g transform="scale(0.25)"><g transform="{tr}">{paths}</g></g></g>'


stamp_jsx = (STAMP.replace('<!--', '{/*').replace('-->', '*/}').replace('baseFrequency', 'baseFrequency').replace('numOctaves', 'numOctaves')
             .replace('xChannelSelector', 'xChannelSelector').replace('yChannelSelector', 'yChannelSelector'))
def gg(name):
    tr, paths = out[name]; paths = paths.replace('"/>', '" />')
    return f'<g fill={{ground}}><g transform="scale(0.25)"><g transform="{tr}">{paths}</g></g></g>'


tsx = f'''/* Generated by ../logo_build.py from the owner's logo, traced part by part: do not edit by hand. */
import React from 'react';
export const LOGO = {{cx: {cx:.2f}, cy: {cy:.2f}, r: {m['r']:.2f}, ringR: {m['ring_r']:.2f}, ringW: {m['ring_w']:.2f}, view: [{VX:.1f}, {VY}, {VW}, {VH}] as const, propL: [257, 407] as const, propR: [907, 407] as const, copyDx: [{NAME_DX}, {SIGN_DX}] as const}};
export const Stamp: React.FC = () => ({stamp_jsx});
export const Ring: React.FC = () => (<circle cx={{LOGO.cx}} cy={{LOGO.cy}} r={{LOGO.ringR}} fill="none" stroke="currentColor" strokeWidth={{LOGO.ringW}} />);
export const Mark: React.FC<{{ground: string}}> = ({{ground}}) => (<g>{gg('mark_back')}{gj('mark')}</g>);
export const TitleArc: React.FC<{{ground: string}}> = ({{ground}}) => (<g>{gg('title_back')}{gj('title')}</g>);
export const BottomArc: React.FC = () => ({gj('bottom')});
export const PropL: React.FC = () => ({gj('prop_l')});
export const PropR: React.FC = () => ({gj('prop_r')});
export const AnchorL: React.FC = () => ({gj('anchor_l')});
export const AnchorR: React.FC = () => ({gj('anchor_r')});
export const CopyName: React.FC = () => ({gj('copy_name')});
export const CopySign: React.FC = () => ({gj('copy_mark')});
'''
open('src/Logo.tsx', 'w').write(tsx)
print('logo written:', len(svg) // 1024, 'KB')
