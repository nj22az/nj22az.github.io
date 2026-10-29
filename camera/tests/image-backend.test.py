#!/usr/bin/env python3
"""Exercise the real HTTP contract with a fake model; no weights or GPU required."""
import base64
import http.client
import importlib.util
import io
import json
from pathlib import Path
import threading
import unittest
from PIL import Image

path=Path(__file__).resolve().parents[1]/'generator'/'server.py'
spec=importlib.util.spec_from_file_location('pocket_image_server',path)
server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)

class FakeEngine:
    ready=True
    def __init__(self): self.request=None
    def generate(self, request):
        self.request=request
        image=Image.new('RGB',(request['width'],request['height']),'#46877f')
        buf=io.BytesIO();image.save(buf,'PNG');return buf.getvalue()

class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine=FakeEngine();cls.token='test-token-with-24-characters-xxxx'
        cls.config=server.Config(engine=cls.engine,token=cls.token,origins={'https://nj22az.github.io'})
        cls.http=server.ThreadingHTTPServer(('127.0.0.1',0),server.make_handler(cls.config))
        cls.port=cls.http.server_address[1]
        cls.thread=threading.Thread(target=cls.http.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls): cls.http.shutdown();cls.http.server_close();cls.thread.join()
    def request(self,method,path,body=None,origin='https://nj22az.github.io',token=True,headers=None):
        h={'Origin':origin}
        if token: h['Authorization']='Bearer '+self.token
        if headers: h.update(headers)
        c=http.client.HTTPConnection('127.0.0.1',self.port,timeout=10)
        c.request(method,path,body=body,headers=h);r=c.getresponse();data=r.read();result=(r.status,dict(r.getheaders()),data);c.close();return result
    def test_health_and_auth(self):
        status,h,data=self.request('GET','/v1/health');self.assertEqual(status,200);self.assertTrue(json.loads(data)['ready']);self.assertEqual(h['Access-Control-Allow-Origin'],'https://nj22az.github.io')
        self.assertEqual(self.request('GET','/v1/health',token=False)[0],401)
        self.assertEqual(self.request('GET','/v1/health',origin='https://untrusted.example')[0],403)
    def test_preflight_and_generation(self):
        status,h,_=self.request('OPTIONS','/v1/generate',token=False,headers={'Access-Control-Request-Private-Network':'true'});self.assertEqual(status,204);self.assertEqual(h['Access-Control-Allow-Private-Network'],'true')
        req=json.dumps({'prompt':'A harbour','width':512,'height':512,'seed':7});status,h,data=self.request('POST','/v1/generate',body=req,headers={'Content-Type':'application/json'})
        self.assertEqual(status,200);self.assertEqual(h['Content-Type'],'image/png');self.assertEqual(Image.open(io.BytesIO(data)).size,(512,512));self.assertEqual(self.engine.request['seed'],7)
    def test_input_validation_and_busy(self):
        headers={'Content-Type':'application/json'}
        for payload in ({'prompt':''},{'prompt':'x','width':513},{'prompt':'x','seed':-1},{'prompt':'x','image':'data:text/plain;base64,YQ=='},{'prompt':'x','unexpected':True}):
            self.assertEqual(self.request('POST','/v1/generate',body=json.dumps(payload),headers=headers)[0],400)
        self.assertEqual(self.request('POST','/v1/generate',body='{}',headers={'Content-Type':'text/plain'})[0],415)
        self.config.lock.acquire()
        try: self.assertEqual(self.request('POST','/v1/generate',body=json.dumps({'prompt':'x'}),headers=headers)[0],429)
        finally: self.config.lock.release()
    def test_reference_image(self):
        buf=io.BytesIO();Image.new('RGB',(20,10),'red').save(buf,'PNG')
        value='data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode()
        req={'prompt':'Paint this','image':value};status,_,_=self.request('POST','/v1/generate',body=json.dumps(req),headers={'Content-Type':'application/json'})
        self.assertEqual(status,200);self.assertEqual(self.engine.request['image'].size,(20,10))

if __name__=='__main__': unittest.main()
