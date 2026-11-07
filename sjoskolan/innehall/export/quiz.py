"""Quizen vecka-XX/aktuell/Quiz.html ur ytan quiz (en placering per text, i ordning).
Sidmallen ligger i verktyg/inlamning/quiz_mall.py, fälten i verktyg/inlamning/sjalvrattning.py (dokument_falt)."""
import importlib.util

import rendera as R

PUBLIK = 'elev'
YTA = 'quiz'


def _mall():
    spec = importlib.util.spec_from_file_location('quiz_mall', R.SJO / 'verktyg' / 'inlamning' / 'quiz_mall.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def filer(a):
    mall = _mall()
    ut = {}
    for plats in a.platser(YTA):
        nr = int(plats.split('-')[1].split('/')[0])
        ut[plats] = mall.sida(nr, a.placeringar(YTA, plats))
    return ut
