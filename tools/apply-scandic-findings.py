#!/usr/bin/env python3
"""Apply reviewed Swedish Scandic evidence, preserving unrelated hotel records.

This is a reviewed-data migration, not a source of new parking claims.
Optional location enrichment accepts only matching official hotel structured data.
"""
import argparse
import copy
import csv
from decimal import Decimal
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import subprocess
import unicodedata
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'blog/hotels'
FINDINGS = FOLDER / 'scandic-sweden-findings-2026-10-24.json'
DATE = '2026-10-24'
HEADERS = ['Hotel','City','Country','Address','Recorded date','Currency','Room price paid','Parking paid','Total paid','Free parking','Parking arrangement','Parking payment','Parking receipt','Parking on hotel receipt','Parking category','Short review','Hotel website','Parking website','Source','Country code','Nights','Average room paid per night','Price note','Latitude','Longitude','Coordinate source','Parking verification','Parking checked date','Parking confirmation source','Payment at hotel','Free parking area','Weekday parking','Weekend parking','Free-area spaces','Reception registration','Paid parking alternatives','Evidence basis']

def norm(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text).casefold() if c.isalnum() and not unicodedata.combining(c))

class StructuredPage(HTMLParser):
    def __init__(self):
        super().__init__(); self.scripts=[]; self.links=[]; self.active=False; self.text=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='script' and (attrs.get('type') in ('application/ld+json','application/json') or attrs.get('id')=='__NEXT_DATA__'):
            self.active=True;self.text=[]
        if tag=='a' and attrs.get('href'):self.links.append(attrs['href'])
    def handle_data(self, data):
        if self.active:self.text.append(data)
    def handle_endtag(self, tag):
        if tag=='script' and self.active:self.scripts.append(''.join(self.text));self.active=False

def objects(value):
    if isinstance(value,dict):
        yield value
        for child in value.values():yield from objects(child)
    elif isinstance(value,list):
        for child in value:yield from objects(child)

def official_location(property):
    """No approximate geocoding, map-centre fallback or invented coordinates."""
    result={'hotelId':property['hotelId'],'coordinates':None,'postalCode':property.get('postalCode')}
    try:
        req=Request(property['sourceUrl'],headers={'User-Agent':'HotelParkingRegister/1.0 (property location verification)'})
        with urlopen(req,timeout=15) as response:
            if urlparse(response.url).netloc not in ('www.scandichotels.com','scandichotels.com'):
                raise ValueError('Unexpected source host')
            page=response.read(8_000_000).decode('utf-8')
        parser=StructuredPage();parser.feed(page)
        for raw in parser.scripts:
            try:data=json.loads(raw)
            except (ValueError,TypeError):continue
            for obj in objects(data):
                name=obj.get('name') or obj.get('hotelName')
                if not isinstance(name,str) or norm(name)!=norm(property['name']):continue
                address=obj.get('address')
                if isinstance(address,dict) and address.get('postalCode'):
                    result['postalCode']=str(address['postalCode'])
                for geo in (obj.get('geo'),obj.get('coordinates'),obj.get('location'),obj):
                    if not isinstance(geo,dict):continue
                    lat=geo.get('latitude',geo.get('lat'));lng=geo.get('longitude',geo.get('lng',geo.get('lon')))
                    try:lat,lng=float(lat),float(lng)
                    except (TypeError,ValueError):continue
                    if 55<=lat<=70 and 10<=lng<=25:
                        result['coordinates']={'latitude':lat,'longitude':lng,'sourceUrl':property['sourceUrl']}
        if not result['postalCode']:
            for url in parser.links:
                if urlparse(url).netloc not in ('www.google.com','maps.google.com'):continue
                destination=parse_qs(urlparse(url).query).get('destination',[''])[0]
                if property['name'] not in destination:continue
                match=re.search(r'\b(\d{3}\s?\d{2})\b',destination)
                if match:result['postalCode']=match.group(1)
        result['result']='Official coordinate matched' if result['coordinates'] else 'No verified coordinates; do not plot an approximate point'
    except Exception as exc:
        result['result']='Location retrieval unavailable: '+type(exc).__name__
    return result

def parking_summary(p):
    text='Free outdoor guest parking on weekdays and weekends.'
    if p['spaces'] is not None:text+=f" {p['spaces']} outdoor spaces listed."
    if p['registrationAtReception'] is True:text+=' Register the vehicle at reception.'
    if p['hotelId']=='scandic-skelleftea':
        text='Free outdoor parking; paid garage. Outdoor parking is free on weekdays and weekends. The separate 40-space garage costs SEK 100 by day (08:30–16:30), SEK 220 overnight (17:00–08:00), or SEK 270 per 24 hours, on both weekdays and weekends. Outdoor capacity is not published.'
    elif p['notes']:
        if p['notes'] not in text:text+=' '+p['notes']
    return text

def make_record(p, location):
    url=p['sourceUrl']; summary=parking_summary(p)
    conditions='The outdoor spaces cannot be reserved. Electric-vehicle charging is not confirmed as free. Parking availability is not guaranteed.'
    if p['registrationAtReception'] is not True:
        conditions+=' The page does not state a vehicle-registration requirement; this is not confirmation that no registration is required.'
    return {'id':p['hotelId']+'-'+DATE,'hotelId':p['hotelId'],'name':p['name'],'city':p['city'],'country':'Sweden','countryCode':'SE','address':p['address'],'postalCode':location.get('postalCode'),'coordinates':location.get('coordinates'),'recordedOn':DATE,'stayDates':None,'nights':None,'currency':None,'currencyLabel':None,'roomPaid':None,'parkingPaid':0,'priceNote':'Accommodation price not recorded. Zero parking charge applies only to the specified free outdoor guest-parking area; it is not the price of a paid garage.','freeParking':True,'parkingPaymentAtHotel':None,'parkingType':'free','parkingLabel':'Free outdoor parking; paid garage' if p['paidAlternatives'] else 'Free outdoor guest parking','parkingOperator':None,'parkingSummary':summary,'parkingPayment':'No charge for the outdoor option; register at reception' if p['registrationAtReception'] else 'No parking charge for the specified outdoor option','parkingReceipt':'Not applicable — no charge for the specified outdoor option','parkingOnHotelReceipt':None,'summary':summary,'review':[summary,conditions,'This is a sourced parking-information entry, not a personal accommodation review. No room price or service rating has been supplied.'],'hotelUrl':url,'parkingUrl':url,'identityCheckedOn':DATE,'sourceNote':"Scandic's official property page, Amenities > Parking, was reviewed on 24 October 2026. The named outdoor option explicitly lists free parking under both weekday and weekend prices. These findings are property-specific, not a chain-wide policy.",'parkingVerification':{'status':'confirmed-free','checkedOn':DATE,'sourceUrl':url},'parkingDetails':{'freeArea':p['freeArea'],'weekday':'Free','weekend':'Free','spaces':p['spaces'],'registrationAtReception':p['registrationAtReception'],'paidAlternatives':p['paidAlternatives'],'basis':'Official property parking tariffs: weekdays and weekends'}}

def export_csv(reviews):
    out=io.StringIO(newline='');writer=csv.writer(out,lineterminator='\r\n');writer.writerow(HEADERS)
    def number(value):return '' if value is None else str(value)
    for r in reviews:
        free=r['freeParking'];d=r.get('parkingDetails',{});v=r['parkingVerification'];point=r.get('coordinates') or {}
        room=r['roomPaid'];parking=r['parkingPaid'];nights=r.get('nights')
        total=None if room is None or parking is None else Decimal(str(room))+Decimal(str(parking))
        average=None if room is None or not nights else (Decimal(str(room))/nights).quantize(Decimal('0.01'))
        receipt='Not applicable — no parking charge' if free else {True:'Yes',False:'No',None:'Not confirmed'}[r['parkingOnHotelReceipt']]
        paid=' | '.join(f"{a['area']}: {a['currency']} {a['weekday']['day']} day; {a['weekday']['night']} night; {a['weekday']['per24Hours']} per 24 hours, weekdays and weekends" for a in d.get('paidAlternatives',[]))
        row=[r['name'],r['city'],r['country'],', '.join([r['address'],' '.join(x for x in (r.get('postalCode'),r['city']) if x),r['country']]),r['recordedOn'],r['currency'] or r.get('currencyLabel') or '',number(room),number(parking),number(total),'Yes' if free else 'No',r['parkingLabel']+'. '+r['parkingSummary'],r['parkingPayment'],r['parkingReceipt'],receipt,'Green — Free parking' if free else ('Yellow — Easy parking' if r['parkingPaymentAtHotel'] else 'Red — Paid parking / Avoid'),r['summary'],r['hotelUrl'],r['parkingUrl'] or '',r['sourceNote'],r['countryCode'],number(nights),number(average),r.get('priceNote') or '',number(point.get('latitude')),number(point.get('longitude')),point.get('sourceUrl',''),'Confirmed free parking' if free else 'Confirmed paid parking',v['checkedOn'],v['sourceUrl'],'Not applicable — free parking' if free else ('Yes' if r['parkingPaymentAtHotel'] else 'No'),d.get('freeArea',''),d.get('weekday',''),d.get('weekend',''),number(d.get('spaces')),'Required at reception' if d.get('registrationAtReception') is True else ('Not stated on reviewed page' if d else ''),paid,d.get('basis','')]
        assert len(row)==len(HEADERS);writer.writerow(row)
    (FOLDER/'hotel-reviews.csv').write_bytes(b'\xef\xbb\xbf'+out.getvalue().encode('utf-8'))
    readback=list(csv.DictReader(io.StringIO(out.getvalue())))
    assert len(readback)==len(reviews)
    for r,c in zip(reviews,readback):
        assert c['Hotel']==r['name'] and c['Room price paid']==number(r['roomPaid'])
        assert c['Parking paid']==number(r['parkingPaid']) and c['Parking confirmation source']==r['parkingVerification']['sourceUrl']

def apply(enrich=False):
    manifest=json.loads(FINDINGS.read_text(encoding='utf-8'));properties=manifest['properties']
    assert len(properties)==18 and len({p['hotelId'] for p in properties})==18
    for p in properties:
        assert p['weekday']==p['weekend']=='Free parking'
        assert p['sourceUrl']=='https://www.scandichotels.com/en/hotels/'+p['hotelId']
        assert p['registrationAtReception'] in (True,None)
    path=FOLDER/'hotels.json';data=json.loads(path.read_text(encoding='utf-8'));reviews=data['reviews'];before=copy.deepcopy(reviews)
    locations={p['hotelId']:{'hotelId':p['hotelId'],'coordinates':None,'postalCode':p.get('postalCode')} for p in properties}
    if enrich:
        with ThreadPoolExecutor(max_workers=3) as pool:
            for loc in pool.map(official_location,properties):locations[loc['hotelId']]=loc
    current={r['hotelId']:r for r in reviews}
    for p in properties:
        new=make_record(p,locations[p['hotelId']])
        if p['hotelId'] in current:
            old=current[p['hotelId']]
            for key in ('parkingLabel','parkingSummary','parkingDetails','parkingVerification'):old[key]=new[key]
        else:reviews.append(new)
    ids={p['hotelId'] for p in properties}
    for old in before:
        new=next(r for r in reviews if r['id']==old['id'])
        if old['hotelId'] not in ids:assert new==old,'Unrelated hotel changed'
        for key in ('roomPaid','parkingPaid','nights','currency','currencyLabel','coordinates','review'):assert new.get(key)==old.get(key),'Existing stay observation changed'
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    generator=ROOT/'tools/build-hotels.py';source=generator.read_text(encoding='utf-8')
    marker='<p class="hotel-findings-note">'
    if marker not in source:
        target='      <p class="hotel-intro">Find hotels with confirmed free guest parking in Sweden, Denmark, Norway and Finland. Compare parking arrangements and use the map to see the hotels that match your filters.</p>'
        assert target in source,'Generator intro changed; review before applying'
        source=source.replace(target,target+'\n      <p class="hotel-findings-note"><strong>Swedish Scandic update: 18 reviewed hotels with a free outdoor option on weekdays and weekends.</strong> This is a verified subset, not the complete chain. The free-parking label applies to the named area only. Registration instructions and paid garages are stated in each entry. <a href="/blog/hotels/scandic-sweden-findings-2026-10-24.json">View the dated evidence records</a>.</p>')
        generator.write_text(source,encoding='utf-8')
    subprocess.run(['python3',str(generator)],check=True,cwd=ROOT)
    export_csv(reviews)
    html=(FOLDER/'index.html').read_text(encoding='utf-8')
    for p in properties:
        r=next(r for r in reviews if r['hotelId']==p['hotelId'])
        assert r['freeParking'] and r['parkingDetails']['weekday']==r['parkingDetails']['weekend']=='Free'
        assert r['id'] in html and r['parkingVerification']['sourceUrl'] in html
    sk=next(r for r in reviews if r['hotelId']=='scandic-skelleftea')
    assert sk['parkingDetails']['spaces'] is None
    assert sk['parkingDetails']['paidAlternatives'][0]['spaces']==40
    assert 'SEK 270 per 24 hours' in sk['parkingSummary']
    va=next(r for r in reviews if r['hotelId']=='scandic-vasteras')
    assert va['parkingDetails']['registrationAtReception'] is True
    el=next(r for r in reviews if r['hotelId']=='scandic-elmia')
    assert el['freeParking'] is False and el['parkingPaymentAtHotel'] is False and el['roomPaid']==1107 and el['parkingPaid']==105
    ma=next(r for r in reviews if r['hotelId']=='hotel-marina')
    assert ma['roomPaid']==5728.46 and ma['nights']==5 and ma['currency'] is None
    report={'reviewedSwedishScandics':18,'totalRegisterHotels':len(reviews),'totalFreeOptions':sum(r['freeParking'] for r in reviews),'addedHotels':len(reviews)-len(before),'existingRecordsPreserved':True,'csvRows':len(reviews),'csvColumns':len(HEADERS),'allReviewedSourcesPresent':True,'mapLocations':sum(r['coordinates'] is not None for r in reviews),'locationsNotPlotted':[r['name'] for r in reviews if r['coordinates'] is None],'skellefteaGarageSeparate':True,'vasterasRegistrationPreserved':True,'personalPricesPreserved':True,'coverageComplete':False}
    (FOLDER/'SCANDIC-PUBLICATION-CHECKS-2026-10-24.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    note=f'''# Swedish Scandic parking findings — 24 October 2026

## Owner decision
Publish the verified Swedish findings. Fee confirmation comes first: explicit free
weekday and weekend tariffs for the named outdoor guest-parking area. Registration
instructions and paid alternatives remain visible; do not invent no-registration,
guaranteed availability, free EV charging, or full-chain coverage. Detailed colour
refinement is deferred at the owner's request.

## Implemented
- Eighteen Swedish Scandic hotels reviewed individually against official property
  Amenities > Parking sections. {report['addedHotels']} added; existing Swedish records refreshed.
- Register now has {len(reviews)} hotels and {report['totalFreeOptions']} confirmed free options.
- Scandic Skellefteå: outdoor parking free on weekdays/weekends, with unknown
  outdoor capacity. Separate 40-space garage: SEK 100 day (08:30–16:30), SEK 220
  night (17:00–08:00), or SEK 270 per 24 hours, weekdays and weekends.
- Scandic Västerås: reception registration explicitly required. Unknown registration
  at other hotels is not asserted to be unnecessary and does not hide confirmed fees.
- JSON, generated table, notes, map popup summaries and 37-column CSV share the facts.
- Existing prices, reviews and map positions are preserved; no private uploads published.
- Source manifest: [reviewed findings](scandic-sweden-findings-2026-10-24.json).
- Checks: [publication data checks](SCANDIC-PUBLICATION-CHECKS-2026-10-24.json).

## Release state and verification
Prepared by `tools/apply-scandic-findings.py` on the current main checkout.
The publication job runs the existing admission tests, generated-page check,
JavaScript syntax checks and Blog feed test before committing derived files.
Confirm the job result and Pages deployment before calling this live.
Map points are accepted only from matching property structured data, with a source.
Missing verified coordinates remain null, not fabricated. {report['mapLocations']} of
{len(reviews)} register hotels have verified map points; see the checks file for any omissions.
No physical-device, live GPS or Safari acceptance is claimed by this migration.
The separate ChatGPT Sites deployment is not modified by this GitHub Pages update.

## Next actions
Verify the publication commit and Pages result, then complete the release sign-off.
Any wider Nordic/other-chain research remains a separate audit; no bulk unverified
171-hotel list is imported. The existing earlier hotel handover remains historical.
'''
    (FOLDER/'HANDOVER-SCANDIC-2026-10-24.md').write_text(note,encoding='utf-8')
    index=ROOT/'HANDOVER.md';text=index.read_text(encoding='utf-8')
    replacement=f'| Blog: Hotels & Parking | [24 October Swedish Scandic findings](blog/hotels/HANDOVER-SCANDIC-2026-10-24.md). Eighteen Swedish Scandics with official free outdoor weekday/weekend parking; {len(reviews)} total records. Skellefteå paid garage separated; registration notes retained. JSON, generated page and 37-column CSV updated. See the note for publication/check status. |'
    text,count=re.subn(r'^\| Blog: Hotels & Parking \|.*$',lambda match:replacement,text,flags=re.M)
    assert count==1,'Expected exactly one hotel handover row';index.write_text(text,encoding='utf-8')
    readme=FOLDER/'README.md';text=readme.read_text(encoding='utf-8')
    heading='## Current Swedish publication — 24 October 2026'
    if heading not in text:
        text=text.replace('# Hotels & Parking\n','# Hotels & Parking\n\n'+heading+'\n\nThe latest owner instruction is to establish confirmed free guest-parking fees first.\nThe Swedish update lists 18 verified Scandics, with free weekday/weekend outdoor\ntariffs, registration notes and paid alternatives. A free-option label does not\nmean every parking area is free, no registration, or a guaranteed space. Detailed\ncolour refinement is deferred. The CSV now appends seven evidence fields (37 total).\nSee [the current handover](HANDOVER-SCANDIC-2026-10-24.md). Historical counts below\ndescribe earlier releases, not the current register.\n',1)
        readme.write_text(text,encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':
    args=argparse.ArgumentParser(description=__doc__);args.add_argument('--enrich-locations',action='store_true');apply(args.parse_args().enrich_locations)
