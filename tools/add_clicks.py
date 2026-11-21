"""Adds click-to-appear fade animations: every shape named cK_* appears on the K-th click of its slide."""
import re, sys, zipfile, shutil, os, collections
src = sys.argv[1]; tmp = src + ".tmp"
def eff(sid, node, n):
    a, b, c = next(n), next(n), next(n)
    return (f'<p:par><p:cTn id="{a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" nodeType="{node}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{sid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
            f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{c}" dur="400"/><p:tgtEl><p:spTgt spid="{sid}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>')
done = 0
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if re.fullmatch(r"ppt/slides/slide\d+\.xml", it.filename):
            x = data.decode("utf8"); groups = collections.defaultdict(list)
            for sid, k in re.findall(r'<p:cNvPr id="(\d+)" name="c(\d+)_\d+"', x): groups[int(k)].append(sid)
            if groups and "<p:timing" not in x:
                import itertools; n = itertools.count(3); body = ""
                for k in sorted(groups):
                    a, b = next(n), next(n)
                    body += f'<p:par><p:cTn id="{a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="{b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                    body += "".join(eff(sid, "clickEffect" if j == 0 else "withEffect", n) for j, sid in enumerate(groups[k])) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
                T = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' + body +
                     '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
                x = x.replace("</p:sld>", T + "</p:sld>"); data = x.encode("utf8"); done += 1
        zo.writestr(it, data)
shutil.move(tmp, src); print("animated slides:", done)
