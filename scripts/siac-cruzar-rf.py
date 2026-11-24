"""SIAC — cruzamento reprodutível de TLCexp e Xu, somente pesquisa."""
import collections, hashlib, io, json, math, pathlib, time
import requests, pandas as pd
from rdkit import Chem, RDLogger
from rdkit.Chem import inchi
RDLogger.DisableLog("rdApp.*")
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"docs/evidencias/siac-rf-cross"
OUT.mkdir(parents=True,exist_ok=True)
catalog=json.loads((ROOT/"data/siac/identidades-pubchem-76.pesquisa.v2.json").read_text(encoding="utf-8"))["candidatos"]
assert len(catalog)==76
session=requests.Session()
session.headers["User-Agent"]="SIAC research reproducibility/1.0"
def get(url):
    last=None
    for attempt in range(3):
        try:
            r=session.get(url,timeout=(15,60)); r.raise_for_status(); return r.content
        except requests.RequestException as e:
            last=e; time.sleep(2**attempt)
    raise RuntimeError(str(last))
def key(smiles):
    m=Chem.MolFromSmiles(str(smiles))
    if m is None: return None
    k=inchi.MolToInchiKey(m)
    if not k:return None
    return Chem.MolToSmiles(m,isomericSmiles=True),k
def pubchem(cids):
    if not cids:return []
    url="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/"+",".join(map(str,cids))+"/property/SMILES,InChIKey/JSON"
    try:
        return json.loads(get(url))["PropertyTable"]["Properties"]
    except Exception as e:
        if len(cids)>1:
            mid=len(cids)//2; return pubchem(cids[:mid])+pubchem(cids[mid:])
        print("PUBCHEM_FALHA",cids,str(e)); return []
bycid=collections.defaultdict(list)
for c in catalog:
    cid=c.get("referenciaQuimica",{}).get("pubchemCID")
    if cid:bycid[int(cid)].append(c)
properties={}
cids=list(bycid)
for start in range(0,len(cids),20):
    for p in pubchem(cids[start:start+20]):properties[int(p["CID"])]=p
    time.sleep(.3)
exact=collections.defaultdict(list); connectivity=collections.defaultdict(list); normalized=collections.defaultdict(list)
reference={}
for c in catalog:
    cid=c.get("referenciaQuimica",{}).get("pubchemCID")
    p=properties.get(cid,{})
    s=p.get("SMILES") or p.get("IsomericSMILES")
    k=key(s) if s else None
    if k:
        canon,ik=k
        exact[canon].append(c["id"]);normalized[ik].append(c["id"]);connectivity[ik.split("-")[0]].append(c["id"])
    reference[c["id"]]={"nome":c["nome"],"grupo":c["grupo"],"cid":cid,"smiles":s,"inchikey":p.get("InChIKey"),"canonicalizada":bool(k)}
def scalar(x):
    if pd.isna(x):return None
    return x.item() if hasattr(x,"item") else x
def norm_sol(name):
    s=str(name).strip().lower()
    return {"etoac":"ethyl acetate","ea":"ethyl acetate","dcm":"dichloromethane","meoh":"methanol","et2o":"diethyl ether","h":"hexane","i-proh":"isopropanol","2-propanol":"isopropanol","n-hexane":"n-hexane"}.get(s,s)
results=[]; sources={}
def cross(df,source,smilescol,rfcol,solvents):
    bad=0; invalid=0; n=0
    for i,row in df.iterrows():
        try:rf=float(row[rfcol])
        except (ValueError,TypeError):invalid+=1;continue
        if not math.isfinite(rf) or not 0<=rf<=1:invalid+=1;continue
        k=key(row[smilescol])
        if not k:bad+=1;continue
        canon,ik=k; n+=1
        hits={}
        for ident in connectivity.get(ik.split("-")[0],[]):hits[ident]="conectividade_apenas"
        for ident in normalized.get(ik,[]):hits[ident]="inchikey_normalizado"
        for ident in exact.get(canon,[]):hits[ident]="estrutura_exata"
        if not hits:continue
        components=solvents(row)
        solvent_set=sorted({norm_sol(s["solvente"]) for s in components if s.get("solvente") and s.get("proporcao",0)>0})
        for ident,classification in hits.items():
            results.append({"fonte":source,"linha_planilha":int(i)+2,"analito":ident,"tipo_correspondencia":classification,
              "smiles_fonte":str(row[smilescol]),"inchikey_fonte":ik,"rf":rf,"componentes":components,"conjunto_solventes":solvent_set,
              "doi":scalar(row.get("doi")),"label":scalar(row.get("label")),"homologado":False})
    return {"linhas":len(df),"estruturas_rf_validos":n,"smiles_invalidos":bad,"rf_invalidos":invalid,"colunas":list(map(str,df.columns))}
def tlc_sol(row):
    out=[]
    for i in (1,2,3):
        s=scalar(row.get("Solvent_"+str(i))); v=scalar(row.get("Fraction_"+str(i)))
        if s is not None and v is not None and float(v)>0:out.append({"solvente":str(s),"proporcao":float(v)})
    return out
def xu_sol(row):
    return [{"solvente":s,"proporcao":float(row[c])} for c,s in [("H","hexane"),("EA","ethyl acetate"),("DCM","dichloromethane"),("MeOH","methanol"),("Et2O","diethyl ether")] if c in row and pd.notna(row[c]) and float(row[c])>0]
try:
    url="https://zenodo.org/records/18467289/files/rf_dataset_0203_total.csv?download=1"
    data=get(url); md5=hashlib.md5(data).hexdigest()
    if md5!="6752adb770b63327431fca04838ca717":raise ValueError("MD5 divergente: "+md5)
    df=pd.read_csv(io.BytesIO(data),encoding="utf-8-sig")
    sources["TLCexp"]={"status":"ok","url":url,"md5":md5,**cross(df,"TLCexp","SMILES","Rf_value",tlc_sol)}
except Exception as e:sources["TLCexp"]={"status":"falha","erro":str(e)}
try:
    url="https://raw.githubusercontent.com/woshixuhao/Discovery_of_column_chromatography/main/data/TLC_dataset.xlsx"
    data=get(url);df=pd.read_excel(io.BytesIO(data))
    assert {"smiles","Rf","H","EA","DCM","MeOH","Et2O"}.issubset(df.columns),list(df.columns)
    sources["Xu"]={"status":"ok","url":url,"sha256":hashlib.sha256(data).hexdigest(),**cross(df,"Xu","smiles","Rf",xu_sol)}
except Exception as e:sources["Xu"]={"status":"falha","erro":str(e)}
byid=collections.defaultdict(list)
for row in results:byid[row["analito"]].append(row)
summary=[]
for ident,r in reference.items():
    entries=byid[ident];verified=[x for x in entries if x["tipo_correspondencia"]=="estrutura_exata"]
    systems={tuple(x["conjunto_solventes"]) for x in verified if x["conjunto_solventes"]}
    summary.append({"id":ident,"nome":r["nome"],"grupo":r["grupo"],"identidade_referencial_disponivel":r["canonicalizada"],
      "exatos":len(verified),"normalizados":sum(x["tipo_correspondencia"]=="inchikey_normalizado" for x in entries),
      "conectividade_apenas":sum(x["tipo_correspondencia"]=="conectividade_apenas" for x in entries),
      "sistemas_quimicamente_distintos":len(systems),"dois_sistemas":len(systems)>=2,
      "fontes_exatas":dict(collections.Counter(x["fonte"] for x in verified))})
out={"estado":"triagem_nao_homologada","fontes":sources,"referencias":reference,"resumo":summary,"registros":results,
 "alerta":"Mesmo estrutura exata não confirma pureza, forma da amostra, suporte ou método; proporções diferentes dos mesmos solventes não contam como dois sistemas. Conferir DOI e artigo original."}
(OUT/"cruzamento.json").write_text(json.dumps(out,ensure_ascii=False,indent=2,allow_nan=False),encoding="utf-8")
pd.DataFrame(summary).to_csv(OUT/"resumo.csv",index=False)
print("SIAC_CROSS_SOURCES",json.dumps(sources,ensure_ascii=False))
print("SIAC_CROSS_SUMMARY",json.dumps({"referencias_canonicalizadas":sum(r["canonicalizada"] for r in reference.values()),"total_catalogo":len(reference),"especies_exatas":sum(x["exatos"]>0 for x in summary),"especies_dois_sistemas":sum(x["dois_sistemas"] for x in summary),"registros_exatos":sum(x["exatos"] for x in summary),"correspondencias": [x for x in summary if x["exatos"] or x["normalizados"] or x["conectividade_apenas"]]},ensure_ascii=False))
for row in results:
    if row["tipo_correspondencia"]=="estrutura_exata":
        print("SIAC_CROSS_ROW",json.dumps(row,ensure_ascii=False))
if any(x["status"]!="ok" for x in sources.values()) or sum(r["canonicalizada"] for r in reference.values())<len(cids):
    raise SystemExit("Cruzamento parcial: verificar falhas de download ou identidades. Artefatos preservados.")
