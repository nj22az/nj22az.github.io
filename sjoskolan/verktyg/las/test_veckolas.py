"""Regressioner för veckolåsets gräns och verkliga Week 40-beroenden."""
from contextlib import redirect_stdout
from io import StringIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from beroenden import beroenden
import veckolas


class VeckolasTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.sjo = Path(self.temp.name) / 'sjoskolan'
        self.har = self.sjo / 'verktyg/las'
        self.har.mkdir(parents=True)
        for name, value in {
            'SJO': self.sjo, 'HAR': self.har, 'OMFANG': {'40': ['vecka-40/**/*']},
            'STARTFILER': {'40': ['vaxelstromslabbet/index.html']},
        }.items():
            p = patch.object(veckolas, name, value)
            p.start()
            self.addCleanup(p.stop)
        self.skriv('vecka-40/index.html', '<a href="../vaxelstromslabbet/">Labb</a>')
        self.skriv('vaxelstromslabbet/index.html', '''
            <link rel="stylesheet" href="lab.css?v=1">
            <script type="module" src="boot.mjs?v=1"></script>
            <script type="module">import './uppgifter.gen.mjs';</script>
            <a href="../vecka-41/index.html">Nästa vecka</a>
            <link rel="canonical" href="https://example.org/lab/">
        ''')
        self.skriv('vaxelstromslabbet/boot.mjs', '''
            import {value} from './model.mjs?v=1#readout';
            export {D} from '../gemensamt/elevtal.mjs';
            import('./equipment.js?v=1');
            // import './unpublished.mjs';
            /* export * from './unused.mjs'; */
        ''')
        self.skriv('vaxelstromslabbet/model.mjs', 'export const value = 12;')
        self.skriv('vaxelstromslabbet/uppgifter.gen.mjs', 'export const tasks = [];')
        self.skriv('vaxelstromslabbet/equipment.js', 'import{value}from"./model.mjs";')
        self.skriv('gemensamt/elevtal.mjs', 'export const D = 7;')
        self.skriv('vaxelstromslabbet/lab.css', '@import url("../gemensamt/base.css?v=1");')
        self.skriv('gemensamt/base.css', 'body { color: black; }')
        self.las()

    def skriv(self, rel, text):
        p = self.sjo / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding='utf-8')

    def las(self):
        with redirect_stdout(StringIO()):
            veckolas.las('40')

    def kontroll(self):
        out = StringIO()
        with redirect_stdout(out):
            status = veckolas.kontrollera()
        return status, out.getvalue()

    def manifest(self):
        return json.loads((self.har / 'vecka-40.json').read_text())

    def spara_manifest(self, data):
        (self.har / 'vecka-40.json').write_text(json.dumps(data))

    def test_derived_scope_and_unchanged_manifest(self):
        files = self.manifest()['filer']
        self.assertEqual(len(files), 9)
        self.assertIn('gemensamt/elevtal.mjs', files)
        self.assertIn('gemensamt/base.css', files)
        self.assertIn('vaxelstromslabbet/equipment.js', files)
        self.assertIn('vaxelstromslabbet/uppgifter.gen.mjs', files)
        self.assertEqual(self.kontroll()[0], 0)

    def test_material_runtime_changes_are_rejected(self):
        for rel in self.manifest()['filer']:
            with self.subTest(rel=rel):
                p = self.sjo / rel
                old = p.read_text()
                p.write_text(old + '\n/* changed */')
                status, message = self.kontroll()
                self.assertEqual(status, 1)
                self.assertIn(f'{rel} har ändrats', message)
                p.write_text(old)

    def test_deleted_dependency_is_not_silently_omitted(self):
        (self.sjo / 'vaxelstromslabbet/model.mjs').unlink()
        status, message = self.kontroll()
        self.assertEqual(status, 1)
        self.assertIn('saknat beroende', message)
        with self.assertRaises(ValueError):
            self.las()

    def test_unreferenced_later_week_assets_and_tests_remain_editable(self):
        for rel in ['vecka-41/index.html', 'vaxelstromslabbet/later.mjs',
                    'vaxelstromslabbet/tests/test.mjs', 'vaxelstromslabbet/README.md',
                    'gemensamt/later.css']:
            self.skriv(rel, 'new content')
        self.assertEqual(self.kontroll()[0], 0)

    def test_new_transitive_import_requires_manifest_entry_even_if_parent_is_rehashed(self):
        rel = 'vaxelstromslabbet/model.mjs'
        self.skriv(rel, "export * from '../gemensamt/new.mjs?v=2';")
        self.skriv('gemensamt/new.mjs', 'export const value = 24;')
        data = self.manifest()
        data['filer'][rel] = veckolas.summa(self.sjo / rel)
        self.spara_manifest(data)
        self.assertIn('gemensamt/new.mjs är ny', self.kontroll()[1])
        self.las()
        self.assertEqual(self.kontroll()[0], 0)

    def test_manifest_cannot_drop_runtime_dependency(self):
        data = self.manifest()
        del data['filer']['vaxelstromslabbet/model.mjs']
        self.spara_manifest(data)
        self.assertEqual(self.kontroll()[0], 1)

    def test_no_longer_referenced_files_require_explicit_scope_refresh(self):
        rel = 'vaxelstromslabbet/lab.css'
        self.skriv(rel, 'body { color: black; }')
        data = self.manifest()
        data['filer'][rel] = veckolas.summa(self.sjo / rel)
        self.spara_manifest(data)
        self.assertIn('gemensamt/base.css ingår inte längre', self.kontroll()[1])

    def test_changed_roots_or_patterns_are_rejected(self):
        for key in ['startfiler', 'omfang']:
            with self.subTest(key=key):
                data = self.manifest()
                data[key] = []
                self.spara_manifest(data)
                self.assertIn('omfattning/startfiler stämmer inte', self.kontroll()[1])
                self.las()

    def test_unknown_week_and_missing_root_are_rejected(self):
        with patch.object(veckolas, 'OMFANG', {}):
            self.assertIn('omfattning saknas', self.kontroll()[1])
        (self.sjo / 'vaxelstromslabbet/index.html').unlink()
        self.assertIn('saknad startfil', self.kontroll()[1])

    def test_normalisation_cycles_and_external_references(self):
        self.skriv('vaxelstromslabbet/model.mjs', '''
            import './boot.mjs';
            import '/sjoskolan/gemensamt/%C3%A5.mjs?v=3#x';
            import 'https://example.org/library.mjs';
        ''')
        self.skriv('gemensamt/å.mjs', 'export const value = 1;')
        self.skriv('gemensamt/base.css', '''
            @import './extra.css';
            .external { background: url(https://example.org/image.png); }
            .inline { background: url(data:image/png;base64,AAAA); }
        ''')
        self.skriv('gemensamt/extra.css', '.icon { background: url(./icon.svg#shape); }')
        self.skriv('gemensamt/icon.svg', '<svg/>')
        files = beroenden(self.sjo, ['vaxelstromslabbet/index.html'])
        self.assertIn(self.sjo / 'gemensamt/å.mjs', files)
        self.assertIn(self.sjo / 'gemensamt/icon.svg', files)

    def test_new_file_in_original_week_scope_is_still_rejected(self):
        self.skriv('vecka-40/new.html', 'new')
        self.assertIn('vecka-40/new.html är ny', self.kontroll()[1])


class PublishedWeek40Test(unittest.TestCase):
    def test_current_runtime_dependencies_and_narrow_boundary(self):
        files = {p.relative_to(veckolas.SJO).as_posix() for p in veckolas.filer('40')}
        for name in ['index.html', 'boot.mjs', 'app.mjs', 'guided.mjs', 'guided-lessons.mjs',
                     'lessons.mjs', 'model.mjs', 'uppgifter.gen.mjs', 'equipment.js',
                     'equipment-state.mjs', 'stationB-protokoll.mjs', 'lab.css',
                     'guided.css', 'workspace.css', 'equipment.css']:
            self.assertIn('vaxelstromslabbet/' + name, files)
        for name in ['elevtal.mjs', 'markering.mjs', 'labbprotokoll.mjs']:
            self.assertIn('gemensamt/' + name, files)
        for rel in ['vaxelstromslabbet/README.md', 'vaxelstromslabbet/model.test.mjs',
                    'vaxelstromslabbet/tools/build-equipment.mjs', 'vaxelstromslabbet/package-lock.json',
                    'vaxelstromslabbet/equipment.mjs', 'gemensamt/labbpekskarm.css']:
            self.assertNotIn(rel, files)
        data = json.loads((veckolas.HAR / 'vecka-40.json').read_text())
        self.assertEqual(files, set(data['filer']))
        self.assertEqual(veckolas.kontrollera(), 0)


if __name__ == '__main__':
    unittest.main()
