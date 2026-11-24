"""SIAC: busca bibliográfica individual para todos os candidatos; não homologa Rf."""
import concurrent.futures as cf, json, pathlib, re, time, threading, csv, xml.etree.ElementTree as ET
import requests
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"docs/evidencias/siac-literatura-rf";OUT.mkdir(parents=True,exist_ok=True)
base=json.loads((ROOT/"data/siac/matriz-cobertura-dois-metodos.v2.json").read_text())["candidatos"]
aliases={"tartrazina":["tartrazine","FD&C Yellow 5"],"sunset_yellow_fcf":["sunset yellow FCF","E110"],"allura_red_ac":["allura red AC","FD&C Red 40"],"brilliant_blue_fcf":["brilliant blue FCF","FD&C Blue 1"],"indigotine":["indigotine","indigo carmine","indigotin"],"erythrosine":["erythrosine","erythrosin B"],"fast_green_fcf":["fast green FCF"],"ponceau_4r":["ponceau 4R","cochineal red A"],"amaranth":["amaranth dye","amaranth food colour"],"patent_blue_v":["patent blue V"],"quinoline_yellow":["quinoline yellow"],"acetylsalicylic_acid":["acetylsalicylic acid","aspirin"],"paracetamol":["paracetamol","acetaminophen"],"methyl_orange":["methyl orange"],"methyl_red":["methyl red"],"bromothymol_blue":["bromothymol blue"],"cyanidin_3_glucoside":["cyanidin-3-glucoside","cyanidin 3-O-glucoside"],"delphinidin_3_glucoside":["delphinidin-3-glucoside","delphinidin 3-O-glucoside"],"beta_carotene":["beta-carotene","β-carotene"],"alpha_carotene":["alpha-carotene","α-carotene"],"beta_cryptoxanthin":["beta-cryptoxanthin","β-cryptoxanthin"],"pheophytin_a":["pheophytin a","phaeophytin a"],"pheophytin_b":["pheophytin b","phaeophytin b"]}
URL="https://www.ebi.ac.uk/europepmc/webservices/rest"
def request(url,params=None):
    last=None
    for retry in range(2):
        try:
            r=requests.get(url,params=params,timeout=(8,24),headers={"User-Agent":"SIAC research literature retrieval"})
            if not r.ok: raise requests.HTTPError(f"HTTP {r.status_code}: {r.text[:180]}",response=r)
            return r
        except requests.RequestException as e:last=e;time.sleep(1+retry)
    raise RuntimeError(str(last))
# Relevance is the default. Probe before launching 76 queries.
try:
    probe=request(URL+"/search",{"query":"caffeine AND HPTLC","format":"json","pageSize":1}).json()
    if "hitCount" not in probe:raise ValueError("Resposta sem hitCount")
    EPMC_OK=True
    print("SIAC_PROVIDER EuropePMC OK",probe["hitCount"])
except Exception as e:
    EPMC_OK=False
    print("SIAC_PROVIDER EuropePMC ERRO",repr(e))
CROSSREF="https://api.crossref.org/works"
def fallback(terms,reason):
    query=terms[0]+" thin layer chromatography HPTLC retention factor Rf"
    v=request(CROSSREF,{"query.bibliographic":query,"rows":12,"select":"DOI,title,published,container-title,URL,type"}).json()["message"]
    hits=[]
    for x in v.get("items",[]):
        title=" ".join(x.get("title",[]))
        # Crossref is broad bibliographic discovery; hits are not evidence of Rf.
        hits.append({"doi":x.get("DOI"),"title":title,"source":"Crossref","url":x.get("URL"),"journalTitle":" ".join(x.get("container-title",[])),"pubType":x.get("type"),"pmcid":None,"isOpenAccess":None})
    return {"status":"ok","provedor":"Crossref","qualidade":"pistas_bibliograficas_nao_filtradas_por_rf","motivo_fallback":reason,"total_resultados":len(hits),"artigos":hits}
def search(c):
    ident=c["id"]; terms=aliases.get(ident,[ident.replace("_"," ")])
    if c["grupo"]=="aminoacidos" and ident!="glycine":terms+=["L-"+terms[0]]
    term="("+" OR ".join('"'+s+'"' for s in terms)+")"
    technique='("thin layer chromatography" OR "thin-layer chromatography" OR HPTLC OR "paper chromatography")'
    q=term+" AND "+technique+' AND ("Rf" OR "retardation factor" OR "retention factor" OR "hRf")'
    try:
        if not EPMC_OK:raise RuntimeError("Europe PMC indisponível no teste inicial")
        v=request(URL+"/search",{"query":q,"format":"json","pageSize":12,"resultType":"lite"}).json()
        if "hitCount" not in v or "resultList" not in v:raise ValueError("Resposta Europe PMC incompleta")
        hits=[]
        for x in v.get("resultList",{}).get("result",[]):
            hits.append({k:x.get(k) for k in ("id","source","pmcid","doi","title","pubYear","journalTitle","isOpenAccess","pubType")})
        return {"id":ident,"nome":c["nome"],"grupo":c["grupo"],"metodos_atuais":c["metodosComRetencaoIndividual"],"query":q,"termos":terms,"status":"ok","provedor":"EuropePMC","total_resultados":v["hitCount"],"artigos":hits}
    except Exception as e:
        common={"id":ident,"nome":c["nome"],"grupo":c["grupo"],"metodos_atuais":c["metodosComRetencaoIndividual"],"query":q,"termos":terms}
        try:return {**common,**fallback(terms,str(e))}
        except Exception as f:
            return {**common,"status":"erro","erro":str(e),"erro_fallback":str(f),"artigos":[]}
with cf.ThreadPoolExecutor(max_workers=3) as pool:
    records=list(pool.map(search,base))
assert len(records)==76 and len({x["id"] for x in records})==76
# Priorizar documentos em que a substância é encontrada em tabela identificada como Rf.
# A presença de números na tabela não autoriza associá-los a um Rf individual.
chosen={}
for r in sorted(records,key=lambda x:x["metodos_atuais"]):
    for a in [a for a in r["artigos"] if a.get("pmcid") and a.get("isOpenAccess")=="Y"][:2]:
        chosen.setdefault(a["pmcid"],a)
def clean(s):return " ".join(s.split())
def get_tables(item):
    pmcid,a=item
    try:
        root=ET.fromstring(request(URL+"/"+pmcid+"/fullTextXML").content)
        tables=[]
        for t in root.findall(".//table-wrap"):
            cap=clean(" ".join(t.find("caption").itertext())) if t.find("caption") is not None else ""
            labels=[]
            for tr in t.findall(".//tr"):
                row=[clean(" ".join(cell.itertext())) for cell in tr if cell.tag in ("td","th")]
                if row:labels.append(row)
            header=" ".join(" ".join(r) for r in labels[:3])
            if re.search(r"\b(?:h?R\s*[_-]?\s*f|retardation factor|retention factor)\b",cap+" "+header,re.I):
                matches=[]
                for r in records:
                    for row in labels:
                        line=" ".join(row)
                        if any(re.search(r"(?<!\w)"+re.escape(s)+r"(?!\w)",line,re.I) for s in r["termos"]):
                            matches.append({"id":r["id"],"celulas":row})
                if matches:tables.append({"label":t.findtext("label"),"caption":cap,"cabecalho":labels[:3],"linhas_candidatas":matches})
        return {"pmcid":pmcid,"doi":a.get("doi"),"title":a.get("title"),"status":"ok","tabelas":tables}
    except Exception as e:return {"pmcid":pmcid,"doi":a.get("doi"),"status":"erro","erro":str(e),"tabelas":[]}
with cf.ThreadPoolExecutor(max_workers=4) as pool: docs=list(pool.map(get_tables,chosen.items()))
for r in records:
    r["tabelas_candidatas"]=[{"pmcid":d["pmcid"],"doi":d.get("doi"),"tabela":t["label"],"linhas":sum(m["id"]==r["id"] for m in t["linhas_candidatas"])} for d in docs for t in d["tabelas"] if any(m["id"]==r["id"] for m in t["linhas_candidatas"])]
summary={"catalogo":len(records),"consultas_ok":sum(x["status"]=="ok" for x in records),"consultas_erro":sum(x["status"]!="ok" for x in records),"com_resultados":sum(x.get("total_resultados",0)>0 for x in records),"artigos_xml_solicitados":len(docs),"artigos_xml_ok":sum(x["status"]=="ok" for x in docs),"especies_com_linhas_tabela":sum(bool(x["tabelas_candidatas"]) for x in records),"novos_rf_homologados":0,"consultas_por_provedor":{p:sum(x.get("provedor")==p for x in records) for p in ("EuropePMC","Crossref")}}
(OUT/"literatura.json").write_text(json.dumps({"estado":"triagem_automatica_nao_homologada","resumo":summary,"candidatos":records,"documentos":docs},ensure_ascii=False,indent=2))
with (OUT/"cobertura.csv").open("w",newline="",encoding="utf-8") as f:
    w=csv.writer(f);w.writerow(["id","nome","grupo","metodos_atuais","status","resultados_bibliograficos","tabelas_candidatas"])
    for r in records:w.writerow([r["id"],r["nome"],r["grupo"],r["metodos_atuais"],r["status"],r.get("total_resultados",""),len(r["tabelas_candidatas"])])
print("SIAC_LIT_SUMMARY",json.dumps(summary,ensure_ascii=False))
for r in records:print("SIAC_LIT_CANDIDATE",json.dumps({k:r.get(k) for k in ("id","status","provedor","erro","erro_fallback","motivo_fallback","total_resultados","metodos_atuais","tabelas_candidatas")},ensure_ascii=False))
for r in records:
    if r["status"]=="ok" and r.get("provedor")=="Crossref":print("SIAC_LIT_FALLBACK",json.dumps({"id":r["id"],"artigos":r["artigos"][:5]},ensure_ascii=False))
for d in docs:
    if d["tabelas"]:print("SIAC_LIT_TABLE",json.dumps(d,ensure_ascii=False))
if summary["consultas_erro"]:raise SystemExit("Consultas incompletas; relatório parcial preservado")
