"""Hjälpfunktioner för att ändra text i befintliga presentationer med bevarat format."""
import sys, copy
from pptx import Presentation
from pptx.util import Pt

def shape(slide, sid):
    return next(s for s in slide.shapes if s.shape_id == sid)

def set_paras(sh, texts, size=None):
    """Ersätt styckenas text men behåll formatet från första stycket/körningen."""
    tf = sh.text_frame
    paras = tf.paragraphs
    tmpl = copy.deepcopy(paras[0]._p)
    for p in paras[1:]:
        p._p.getparent().remove(p._p)
    first = tf.paragraphs[0]
    for r in first.runs[1:]:
        r._r.getparent().remove(r._r)
    first.runs[0].text = texts[0]
    for t in texts[1:]:
        np_ = copy.deepcopy(tmpl)
        tf._txBody.append(np_)
        from pptx.text.text import _Paragraph
        para = _Paragraph(np_, tf)
        for r in para.runs[1:]:
            r._r.getparent().remove(r._r)
        para.runs[0].text = t
    if size:
        for p in tf.paragraphs:
            for r in p.runs: r.font.size = Pt(size)

def add_para(sh, text, size=None, bold_prefix=None):
    tf = sh.text_frame
    src = tf.paragraphs[-1]._p
    np_ = copy.deepcopy(src)
    src.addnext(np_)
    from pptx.text.text import _Paragraph
    para = _Paragraph(np_, tf)
    for r in para.runs[1:]:
        r._r.getparent().remove(r._r)
    run = para.runs[0]
    if bold_prefix:
        run.text = bold_prefix
        run.font.bold = True
        r2 = copy.deepcopy(run._r); run._r.addnext(r2)
        para.runs[1].text = text; para.runs[1].font.bold = False
    else:
        run.text = text
    if size:
        for r in para.runs: r.font.size = Pt(size)

def drop_notes_line(prs):
    last = prs.slides[len(prs.slides) - 1]
    for sh in list(last.shapes):
        if sh.has_text_frame and 'bildanteckningarna' in sh.text_frame.text:
            sh._element.getparent().remove(sh._element)

