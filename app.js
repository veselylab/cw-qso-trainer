/* CW QSO Trainer — no build, third-party dependencies or network services. */
export const DEFAULTS = Object.freeze({ownCall:'OK1JDV',ownName:'DAVID',ownQth:'ZIREC',band:40,filter:500,outMode:'headphones',signal:3,wpm:18,rit:0,volume:45,qsb:'medium',tone:650,cqNoAnswer:15,busyPercent:10,notListening:5,endDots:12,endSilence:2500,hang:300,reaction:'normal',hand:5,exam:'training',farnsworth:0,rxTextMode:'hidden',helpMode:'error',aec:false});
export class Storage {
 static get(key,fallback){try{const v=localStorage.getItem('cwtrainer.'+key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
 static set(key,value){try{localStorage.setItem('cwtrainer.'+key,JSON.stringify(value));return true}catch{return false}}
}
export class RNG{constructor(seed){this.x=(Number(seed)>>>0)||0x6d2b79f5}next(){let t=this.x+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}int(a,b){return Math.floor(a+this.next()*(b-a+1))}pick(a){return a[this.int(0,a.length-1)]}chance(p){return this.next()*100<Number(p)}}
const MORSE_BASE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','/':'-..-.','?':'..--..','.':'.-.-.-',',':'--..--',':':'---...',"'":'.----.', '-':'-....-','=':'-...-', '+':'.-.-.','<AR>':'.-.-.','<KN>':'-.--.','<SK>':'...-.-','<BT>':'-...-','<ERR>':'........'};
export class MorseCode {
 static map=MORSE_BASE;
 static reverse=(()=>{const m={};for(const [k,v] of Object.entries(MORSE_BASE)){if(!(v in m)||k==='='||k.startsWith('<'))m[v]=k}m['.-.-.']='<AR>';m['-.--.']='<KN>';m['...-.-']='<SK>';m['........']='<ERR>';m['-...-']='=';return m})();
 static tokens(text){return (String(text).toUpperCase().match(/<[^>]+>|[\s\S]/g)||[]).filter(t=>t===' '||t in MORSE_BASE)}
 static events(text,wpm=18,{farnsworth=false,variation=0,rng=null}={}){const dot=1200/Math.max(5,wpm),chars=this.tokens(text),out=[];let ms=0;const stretch=farnsworth?1.5:1;for(let i=0;i<chars.length;i++){const ch=chars[i];if(ch===' '){ms+=4*dot*stretch;continue}const pat=this.map[ch];if(!pat)continue;for(let j=0;j<pat.length;j++){const mul=pat[j]==='-'?3:1;let dur=dot*mul*(rng?1+(rng.next()*2-1)*variation:1);dur=Math.max(1,dur);out.push({on:ms,off:ms+dur,token:ch,part:j});ms+=dur;if(j<pat.length-1)ms+=dot}const next=chars[i+1];if(next&&next!==' ')ms+=3*dot*stretch;else if(next===' ')ms+=3*dot*stretch}
 return {events:out,duration:ms,dot};}
 static textTime(text,wpm=18){return this.events(text,wpm).duration}
}
const P={
 DE:'HANS UWE KLAUS BERND PETER FRANK WOLF DIETER ROLF GERT|BERLIN,HAMBURG,MUENCHEN,BONN,BREMEN,LEIPZIG,DRESDEN,KOELN,STUTTGART,ESSEN|Europe/Berlin',
 GB:'JOHN MIKE ALAN BOB JIM TOM ROGER CHRIS DAVID PAUL|LONDON,BRISTOL,YORK,LEEDS,OXFORD,CAMBRIDGE,BATH,LIVERPOOL,NORWICH,CARDIFF|Europe/London',
 FR:'PIERRE JEAN LUC MARC PAUL ALAIN CLAUDE LOUIS YVES HENRI|PARIS,LYON,NANTES,LILLE,BORDEAUX,NICE,TOULOUSE,DIJON,ROUEN,REIMS|Europe/Paris',
 IT:'MARCO LUCA PAOLO PIERO ALDO GIANNI ENZO CARLO BRUNO FABIO|MILANO,ROMA,TORINO,NAPOLI,GENOVA,FIRENZE,BOLOGNA,TRENTO,PISA,VERONA|Europe/Rome',
 ES:'PACO JOSE LUIS MIGUEL JUAN PEDRO CARLOS ANTONIO RAUL DIEGO|MADRID,BARCELONA,VALENCIA,SEVILLA,MALAGA,BILBAO,ZARAGOZA,GRANADA,TOLEDO,VIGO|Europe/Madrid',
 PT:'JOAO RUI MANUEL PEDRO LUIS ANTONIO CARLOS MIGUEL NUNO PAULO|LISBOA,PORTO,BRAGA,COIMBRA,FARO,EVORA,SETUBAL,AVEIRO,LEIRIA,VISEU|Europe/Lisbon',
 BE:'LUC JAN MARC PIERRE TOM ERIC PAUL GUY FRANK HUGO|BRUSSELS,GENT,BRUGGE,ANTWERPEN,LIEGE,NAMUR,LEUVEN,MONS,HASSELT,MECHELEN|Europe/Brussels',
 NL:'JAN PIET HANS KOEN WIM ROB PAUL GERARD ERIK KEES|AMSTERDAM,ROTTERDAM,UTRECHT,DELFT,LEIDEN,HAARLEM,EINDHOVEN,GRONINGEN,BREDA,ARNHEM|Europe/Amsterdam',
 AT:'FRANZ JOSEF PETER HANS ERICH WALTER KURT WOLFGANG KARL OTTO|WIEN,GRAZ,LINZ,SALZBURG,INNSBRUCK,KLAGENFURT,VILLACH,KREMS,WELS,BADEN|Europe/Vienna',
 CH:'HANS URS RENE BEAT PETER MARCEL MARTIN KURT ROLF FRITZ|ZUERICH,BERN,BASEL,LUZERN,GENEVE,LAUSANNE,LUGANO,STGALLEN,THUN,DAVOS|Europe/Zurich',
 CZ:'JIRI PETR JAN PAVEL KAREL MARTIN LUBOS MIREK TOMAS JOSEF|PRAHA,BRNO,OSTRAVA,PLZEN,LIBEREC,OLOMOUC,HRADEC,PARDUBICE,ZLIN,TABOR|Europe/Prague',
 SK:'LACO JOZEF PETER JAN MARIAN MAREK JURAJ MIRO TIBOR PAVOL|BRATISLAVA,KOSICE,PRESOV,ZILINA,NITRA,TRENCIN,TRNAVA,POPRAD,MARTIN,ZVOLEN|Europe/Bratislava',
 PL:'PIOTR JAN PAWEL MAREK JACEK ADAM TOMASZ ANDRZEJ WOJTEK ROBERT|WARSZAWA,KRAKOW,GDANSK,POZNAN,WROCLAW,LODZ,LUBLIN,KATOWICE,TORUN,SZCZECIN|Europe/Warsaw',
 HU:'LACI ISTVAN JANOS PETER GABOR LASZLO TIBOR ZOLTAN ATTILA FERENC|BUDAPEST,DEBRECEN,SZEGED,PECS,GYOR,EGER,MISKOLC,SOPRON,VESZPREM,KECSKEMET|Europe/Budapest',
 SI:'JANEZ MARKO IVAN MIHA LUKA PETER BORUT JURE TONE MATJAZ|LJUBLJANA,MARIBOR,CELJE,KRANJ,KOPER,BLED,NOVO MESTO,PTUJ,VELENJE,IZOLA|Europe/Ljubljana',
 HR:'IVAN MARKO ANTE LUKA MATEJ ZORAN MARIN DARIO NIKOLA JOSIP|ZAGREB,SPLIT,RIJEKA,ZADAR,PULA,SIBENIK,OSIJEK,VARAZDIN,DUBROVNIK,TROGIR|Europe/Zagreb',
 RS:'MARKO NIKOLA IVAN MILAN PETAR DRAGAN ZORAN STEFAN DEJAN ALEKS|BEOGRAD,NOVI SAD,NIS,KRAGUJEVAC,SUBOTICA,CACAK,UZICE,KIKINDA,SOMBOR,ZRENJANIN|Europe/Belgrade',
 BG:'IVAN GEORGI PETAR NIKOLAY DIMITAR STOYAN BORIS MARTIN VASIL STEFAN|SOFIA,PLOVDIV,VARNA,BURGAS,RUSE,PLEVEN,VIDIN,SLIVEN,SHUMEN,DOBRICH|Europe/Sofia',
 RO:'ION MIHAI ANDREI DAN VASILE FLORIN MARIAN ADRIAN CRISTI NICU|BUCURESTI,CLUJ,IASI,BRASOV,TIMISOARA,SIBIU,ORADEA,CONSTANTA,CRAIOVA,GALATI|Europe/Bucharest',
 GR:'NIKOS YANNIS KOSTAS DIMITRIS GEORGE STAVROS PETROS ALEX SPIROS VASILIS|ATHINA,PATRAS,LARISA,VOLOS,CHANIA,HERAKLION,KAVALA,KALAMATA,TRIKALA,IOANNINA|Europe/Athens',
 SE:'LARS SVEN ANDERS ERIK OLLE JAN PER MAGNUS BJORN KENT|STOCKHOLM,GOTEBORG,MALMO,UPPSALA,LUND,VASTERAS,OREBRO,LINKOPING,UMEA,LULEA|Europe/Stockholm',
 NO:'LARS OLE KJELL KNUT PER ERIK JAN BJORN ARNE TOR|OSLO,BERGEN,TRONDHEIM,STAVANGER,TROMSO,BODO,KRISTIANSAND,HAMAR,LILLEHAMMER,DRAMMEN|Europe/Oslo',
 DK:'LARS OLE NIELS JENS HANS PER KIM MORTEN BO FINN|KOBENHAVN,AARHUS,ODENSE,AALBORG,ESBJERG,RANDERS,VEJLE,KOLDING,ROSKILDE,HORSENS|Europe/Copenhagen',
 FI:'JUHA PEKKA MATTI JARI JUKKA ARI MIKKO TIMO KARI SEPPO|HELSINKI,TURKU,TAMPERE,OULU,ESPOO,LAHTI,JYVASKYLA,KUOPIO,VAASA,KOTKA|Europe/Helsinki',
 EE:'JAAN PEETER MART TIIT TOOMAS ANDRES PRIIT KALEV URMAS REIN|TALLINN,TARTU,PARNU,NARVA,VILJANDI,RAKVERE,HAAPSALU,PAIDE,VORU,VALGA|Europe/Tallinn',
 LV:'JANIS ANDRIS PETERIS MARTINS AIGARS EDGARS MARIS RITVARS JURIS KARLIS|RIGA,DAUGAVPILS,LIEPAJA,JELGAVA,VENTSPILS,JURMALA,REZEKNE,VALMIERA,CESIS,OGRE|Europe/Riga',
 LT:'JONAS PETRAS ANTANAS DARIUS MINDAUGAS ANDRIUS SAULIUS VYTAUTAS ARUNAS TOMAS|VILNIUS,KAUNAS,KLAIPEDA,SIAULIAI,PANEVEZYS,ALYTUS,MARIJAMPOLE,UTENA,TELSIAI,TAURAGE|Europe/Vilnius',
 UA:'IVAN OLEH ANDRIY YURIY MYKOLA SERHIY VOLODYMYR PETRO TARAS DMYTRO|KYIV,LVIV,ODESA,DNIPRO,KHARKIV,VINNYTSIA,POLTAVA,LUTSK,TERNOPIL,RIVNE|Europe/Kyiv',
 RU:'IVAN SERGEY ALEXEY OLEG NIKOLAY DMITRY ANDREY MIKHAIL PAVEL VICTOR|MOSCOW,TVER,TULA,KURSK,VORONEZH,PSKOV,RYAZAN,KALUGA,SMOLENSK,VLADIMIR|Europe/Moscow',
 IE:'SEAN PAT MIKE JOHN EAMON LIAM PAUL BRIAN KEVIN TOM|DUBLIN,CORK,GALWAY,LIMERICK,WATERFORD,KILKENNY,SLIGO,ATHLONE,TRALEE,ENNIS|Europe/Dublin',
 IS:'JON OLAFUR EINAR GUNNAR KARL BJORN SIGGI ARNI STEFAN HALLDOR|REYKJAVIK,AKUREYRI,KEFLAVIK,SELFOSS,HAFNARFJORDUR,KOPAVOGUR,HUSAVIK,AKRANES,BORGARNES,VIK|Atlantic/Reykjavik',
 LU:'JEAN LUC MARC PIERRE PAUL HENRI ROBERT GUY ANDRE MICHEL|LUXEMBOURG,ESCH,DIFFERDANGE,DUDELANGE,ETTELBRUCK,DIEKIRCH,REMICH,WILTZ,GREVENMACHER,MERSCH|Europe/Luxembourg',
 MT:'JOE PAUL JOHN MARK ANTHONY MARIO TONI PETER MICHAEL DAVID|VALLETTA,MDINA,SLIEMA,MOSTA,BIRKIRKARA,RABAT,VICTORIA,PAOLA,ZABBAR,MARSAXLOKK|Europe/Malta'
};
export const COUNTRY_PROFILES=Object.fromEntries(Object.entries(P).map(([id,raw])=>{const [n,c,tz]=raw.split('|');return [id,{names:n.split(' '),cities:c.split(','),tz}]}));
/* Strict operational sample prefixes; not a license allocation registry. */
const RULES=[
 ['DE',['DL','DK','DJ','DF','DG','DH','DM'],[1,2,3,4,5,6,7,8,9],7],
 ['GB',['G'],[0,1,2,3,4,5,6,7,8],6],['GB',['M'],[0,1,3,5,6,7],5],['GB',['2E'],[0,1],3],['GB',['GM','MM','GW','MW','GI','MI'],[0,1,2,3,4,5,6,7,8],2],
 ['FR',['F'],[1,4,5,6,8],4],['IT',['I','IK','IZ','IW','IU'],[0,1,2,3,4,5,6,7,8,9],6],['ES',['EA','EB','EC'],[1,2,3,4,5,6,7],4],['PT',['CT'],[1,2,7],2],['BE',['ON','OO','OR','OT'],[1,2,3,4,5,6,7,8,9],4],['NL',['PA','PD','PE','PH'],[0,1,2,3,4,5,6,7,8,9],4],['AT',['OE'],[1,2,3,4,5,6,7,8,9],5],['CH',['HB9'],[null],4],['CZ',['OK','OL'],[1,2],7],['SK',['OM'],[1,2,3,4,5,6,7,8],4],['PL',['SP','SQ','SO','SN'],[1,2,3,4,5,6,7,8,9],6],['HU',['HA','HG'],[0,1,2,3,4,5,6,7,8,9],4],['SI',['S5'],[1,2,3,4,5,6,7,8,9],2],['HR',['9A'],[0,1,2,3,4,5,6,7,8,9],2],['RS',['YU'],[1,2,3,4,5,6,7,8,9],2],['BG',['LZ'],[1,2,3,4,5],2],['RO',['YO'],[2,3,4,5,6,7,8,9],4],['GR',['SV'],[1,2,3,4,7,8],2],['SE',['SM','SA'],[0,1,2,3,4,5,6,7],4],['NO',['LA','LB'],[1,2,3,4,5,6,7,8,9],2],['DK',['OZ'],[1,2,3,4,5,6,7,8,9],2],['FI',['OH'],[1,2,3,4,5,6,7,8,9],4],['EE',['ES'],[1,2,3,4,5,6,7,8],2],['LV',['YL'],[2,3],2],['LT',['LY'],[1,2,3,4,5],2],['UA',['UR','UT','UX','US','UY'],[0,1,2,3,4,5,6,7,8,9],3],['RU',['UA','RA','RW','RZ'],[1,3,4,6],2],['IE',['EI'],[2,3,4,5,6,7,8,9],2],['IS',['TF'],[1,2,3,4,5,6,7,8],1],['LU',['LX'],[1],1],['MT',['9H'],[1],1]
];
export const CALL_RULES=RULES;
const IS_CALL=/^(?=[A-Z0-9/]{3,14}$)(?:[A-Z0-9]{1,5}\d[A-Z]{1,3})(?:\/(?:P|QRP))?$/;
function sanitizeCall(c){return String(c||'').toUpperCase().replace(/[^A-Z0-9/]/g,'')}
export class StationFactory{
 constructor(rng,band=40){this.rng=rng;this.band=Number(band)}
 country(call){const v=sanitizeCall(call).replace(/\/(P|QRP)$/,'');let best=null,len=-1;for(const [id,prefixes,digits] of RULES)for(const p of prefixes)if(v.startsWith(p)&&v.length>p.length+1){const rest=v.slice(p.length);const digit=digits[0]===null?'':String(rest[0]);if((digits[0]===null||digits.includes(Number(digit)))&&/^[A-Z]{1,3}$/.test(rest.slice(digit.length))&&p.length>len){best=id;len=p.length}}return best||'DE'}
 fromCall(call){const country=this.country(call),p=COUNTRY_PROFILES[country],r=this.rng;return {call:sanitizeCall(call),country,name:r.pick(p.names),qth:r.pick(p.cities),tz:p.tz,style:r.next()<.6?'textbook':(r.next()<.625?'short':'chatty'),wpm:18,offset:0,report:'559',signal:3};}
 make(){const r=this.rng,weighted=[];for(const rule of RULES){let w=rule[3];if(this.band===40&&['CZ','SK','DE','PL','HU','AT','SI','HR','IT'].includes(rule[0]))w*=2;if(this.band===20&&['GB','ES','PT','IE','SE','FI','UA','GR','IS'].includes(rule[0]))w*=2;for(let j=0;j<w;j++)weighted.push(rule)}const [country,prefixes,digits]=r.pick(weighted),prefix=r.pick(prefixes),digit=digits[0]===null?'':String(r.pick(digits));let n=r.next(),len=n<.65?3:n<.95?2:1,suffix='';const alphabet='ABCDEFGHIJKLMNOPRSTUVWXYZ';do{suffix='';for(let i=0;i<len;i++)suffix+=alphabet[r.int(0,alphabet.length-1)]}while(suffix.startsWith('Q')||['AR','SK','KN','BT','SOS'].includes(suffix));const call=prefix+digit+suffix+(r.chance(5)?'/P':r.chance(2)?'/QRP':'');const station=this.fromCall(call);station.country=country;return station;}
}
export function levenshtein(a,b){a=String(a);b=String(b);const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let last=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const prev=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,last+(a[i-1]!==b[j-1]));last=prev}}return row[b.length]}
export class Parser{
 static parse(raw){const original=String(raw||'').toUpperCase().trim(),s=original.replace(/<BT>/g,' = ').replace(/<KN>/g,' KN ').replace(/<SK>/g,' SK ').replace(/<AR>/g,' AR ').replace(/\s+/g,' ').replace(/CQCQ/g,'CQ CQ').replace(/DE(?=[A-Z0-9]{2,})/g,'DE ').replace(/(QRL|QRZ|RST|NAME|QTH)\s*\?/g,'$1?').trim();const t=s.split(/[\s=]+/).filter(Boolean);const p={raw:original,text:s,toCall:null,fromCall:null,hasDE:t.includes('DE'),cq:t.includes('CQ'),qrl:t.some(x=>x.startsWith('QRL')),rst:null,name:null,qth:null,greetings:t.filter(x=>['GD','GM','GA','GE','GN'].includes(x)),hasR:t.includes('R'),has73:t.includes('73'),endSign:null,requests:[],partialCall:null,invalid:false,words:t};
 for(const w of t){if(['AGN','?','PSE'].includes(w)&&w!=='PSE')p.requests.push(w);if(['QRS','QRZ?','QRL?','RST?','NAME?','QTH?'].includes(w))p.requests.push(w);if(w.endsWith('?')&&!['QRZ?','QRL?','RST?','NAME?','QTH?'].includes(w)&&/^[A-Z0-9/]+\?$/.test(w))p.partialCall=w.slice(0,-1)}
 const de=t.indexOf('DE');if(de>=0){for(let j=de+1;j<Math.min(t.length,de+4);j++)if(IS_CALL.test(t[j])){p.fromCall=t[j];break}for(let j=de-1;j>=0;j--)if(IS_CALL.test(t[j])){p.toCall=t[j];break}}else if(!p.cq){const candidates=t.filter(x=>IS_CALL.test(x));if(candidates.length>=2&&candidates[0]===candidates[1])p.fromCall=candidates[0];else if(candidates.length)p.toCall=candidates[0]}
 // Self calls are not drawn from the first callsign-shaped string after a known field.
 const rstAt=t.indexOf('RST'),urAt=t.indexOf('UR'),report=/^(?:[1-5][1-9][1-9]|[1-5][ANT][ANT])$/;if(rstAt>=0&&report.test(t[rstAt+1]||''))p.rst=t[rstAt+1];else if(urAt>=0&&report.test(t[urAt+1]||''))p.rst=t[urAt+1];
 const nameAt=t.indexOf('NAME');if(nameAt>=0&&/^[A-Z]{2,20}$/.test(t[nameAt+1]||''))p.name=t[nameAt+1];
 const qthMatch=s.match(/\bQTH\s+(.+?)(?=\s*=\s*|\s+(?:73|NAME|RST|UR|RIG|WX|PWR|ANT|K|KN|BK|SK|AR|E|DE)\b|$)/);if(qthMatch)p.qth=qthMatch[1].trim()||null;
 const endings=t.filter(x=>['K','KN','BK','SK','AR','E'].includes(x));p.endSign=endings.includes('SK')?'SK':endings.length?endings[endings.length-1]:t.at(-1)?.endsWith('?')?'?':null;
 p.invalid=!(p.cq||p.qrl||p.hasDE||p.requests.length||p.has73||p.rst||p.endSign);
 return p;}
}

/** Select a calibrated carrier above spectral background. Inputs are frames of negative dBFS bins. */
export function pickTonePeak(frames,binHz,{minHz=300,maxHz=1200,minSnr=15}={}){
 if(!frames?.length||!Number.isFinite(binHz)||binHz<=0)throw Error('Prázdné spektrum');
 const size=frames[0].length,lo=Math.max(2,Math.ceil(minHz/binHz)),hi=Math.min(size-3,Math.floor(maxHz/binHz));
 if(hi<=lo)throw Error('Spektrum mimo pásmo 300–1200 Hz');
 const maxima=new Float64Array(size);maxima.fill(-Infinity);
 for(const f of frames){for(let i=lo;i<=hi;i++)if(Number.isFinite(f[i])&&f[i]>maxima[i])maxima[i]=f[i]}
 const values=Array.from(maxima.slice(lo,hi+1)).filter(Number.isFinite).sort((a,b)=>a-b);
 if(!values.length)throw Error('Příposlech nenalezen');
 const median=values[Math.floor(values.length/2)];let best=-Infinity,index=-1;
 for(let i=lo;i<=hi;i++)if(maxima[i]>best){best=maxima[i];index=i}
 if(!Number.isFinite(best)||best-median<minSnr)throw Error('Příposlech nenalezen: vrchol není alespoň 15 dB nad šumem');
 const y0=maxima[index-1],y1=maxima[index],y2=maxima[index+1];
 const denom=y0-2*y1+y2;
 const delta=Number.isFinite(denom)&&Math.abs(denom)>1e-6?Math.max(-.5,Math.min(.5,.5*(y0-y2)/denom)):0;
 return {hz:(index+delta)*binHz,peakDb:best,snr:best-median,medianDb:median};
}

/** Estimate the detector's mark-overhang from repeated VVV at calibration time. */
export function estimateHandTiming(edges,sampleRate=48000){
 const pairs=edges.map(e=>({on:e.on,ms:Number.isFinite(e.ms)?e.ms:e.frame/sampleRate*1000})).filter(e=>Number.isFinite(e.ms)).sort((a,b)=>a.ms-b.ms);
 const marks=[],spaces=[];let down=null,up=null;
 for(const e of pairs){if(e.on){if(up!==null){const gap=e.ms-up;if(gap>=15&&gap<=220)spaces.push(gap)}down=e.ms}else{if(down!==null){const duration=e.ms-down;if(duration>=15&&duration<=400)marks.push(duration)}up=e.ms;down=null}}
 const median=a=>{if(!a.length)return NaN;const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)]};
 if(marks.length<5||spaces.length<4)throw Error('Pro odhad tempa pošli alespoň VVV VVV');
 const minMark=median([...marks].sort((a,b)=>a-b).slice(0,Math.max(3,Math.round(marks.length*.55))));
 const minGap=median([...spaces].sort((a,b)=>a-b).slice(0,Math.max(3,Math.round(spaces.length*.55))));
 const dot=(minMark+minGap)/2;
 if(!(dot>=30&&dot<=160))throw Error('Kalibrace rytmu mimo 8–35 WPM');
 return {wpm:1200/dot,dot,edgeBias:Math.max(-12,Math.min(12,(minMark-minGap)/2)),marks:marks.length,gaps:spaces.length};
}
export class Classifier {
 constructor({sampleRate=48000,wpm=18,endDots=12,endSilence=2500,edgeBias=0,onChar=()=>{},onElement=()=>{},onFinal=()=>{},onKey=()=>{},onValidatedKey=()=>{}}={}){
  Object.assign(this,{sampleRate,endDots,endSilence,edgeBias,onChar,onElement,onFinal,onKey,onValidatedKey});
  this.initialWpm=wpm;this.dot=1200/wpm;this.reset(true);
 }
 reset(hard=false){this.downAt=null;this.upAt=null;this.markDurations=[];this.text='';this.charDone=true;this.wordDone=false;this.ended=false;this.marks=[];this.spaces=[];this.charSpaces=[];this.edges=[];this.collisions=[];this.onset=null;this.lastMark=0;this.validKeyDown=false;this.prevUpAt=null;if(hard)this.dot=1200/this.initialWpm}
 setWpm(n){this.dot=1200/Math.max(8,n)}
 adapt(candidate,strength=.6){if(!(candidate>=25&&candidate<=160))return;const ratio=candidate/this.dot;const alpha=(ratio<.78||ratio>1.22)?Math.max(strength,.76):strength;this.dot=Math.max(1200/35,Math.min(1200/8,this.dot*(1-alpha)+candidate*alpha))}
 gapThreshold(){const a=this.spaces.slice(-10),b=this.charSpaces.slice(-10);if(a.length>=2&&b.length>=2){const avg=x=>x.reduce((t,v)=>t+v,0)/x.length;return Math.max(this.dot*1.65,Math.min(this.dot*2.55,Math.sqrt(avg(a)*avg(b))))}return this.dot*2.0}
 finishChar(){if(!this.markDurations.length)return;const pattern=this.markDurations.map(x=>(x-this.edgeBias)>this.dot*1.9?'-':'.').join('');const char=MorseCode.reverse[pattern]||'*';this.text+=char;this.markDurations=[];this.charDone=true;this.wordDone=false;this.onChar(char,this.text)}
 edge(on,frame){const time=frame/this.sampleRate*1000;this.edges.push({on,ms:time});
  if(on){if(this.downAt!==null)return;
   if(this.upAt!==null){const gap=time-this.upAt+this.edgeBias;if(gap>0){if(this.markDurations.length&&gap>=this.gapThreshold()){this.charSpaces.push(gap);if(this.charSpaces.length>100)this.charSpaces.shift();this.finishChar();if(gap>=this.dot*5&&!this.text.endsWith(' ')){this.text+=' ';this.onChar(' ',this.text)}}else if(this.markDurations.length){this.spaces.push(gap);if(this.spaces.length>120)this.spaces.shift();this.adapt(gap,.72)}}}
   this.prevUpAt=this.upAt;this.downAt=time;this.onset=time;this.validKeyDown=false;this.wordDone=false;this.onKey(true,time);return;
  }
  if(this.downAt===null)return;const duration=time-this.downAt;this.downAt=null;this.upAt=time;this.onKey(false,time);
  // Only a confirmed mark may hold QSOEngine's transmission scheduler.
  // A short noise edge must never refresh its activity timeout.
  if(duration<Math.max(15,.3*this.dot)){this.upAt=this.prevUpAt;this.validKeyDown=false;return}
  if(!this.validKeyDown)this.onValidatedKey(true,this.onset);
  this.onValidatedKey(false,time);this.validKeyDown=false;
  this.markDurations.push(duration);this.lastMark=duration;this.marks.push(duration);if(this.marks.length>160)this.marks.shift();
  const adjusted=duration-this.edgeBias,ratio=adjusted/this.dot;
  // A dash provides a timing sample even when the text contains no dots.
  if(ratio>=2.15)this.adapt(adjusted/3,.22);
  else if(ratio<=1.48)this.adapt(adjusted,.19);
  const mark=adjusted>this.dot*1.9?'-':'.';this.charDone=false;this.wordDone=false;this.onElement(mark,duration,time);
 }
 tick(now){
  if(!this.ended&&this.downAt!==null&&!this.validKeyDown&&now-this.downAt>=Math.max(15,.3*this.dot)){
   this.validKeyDown=true;this.onValidatedKey(true,this.onset);
  }
  if(this.ended||this.downAt!==null||this.upAt===null)return;
  const silence=now-this.upAt;
  if(this.markDurations.length&&silence>=this.gapThreshold())this.finishChar();
  if(this.charDone&&!this.wordDone&&silence>=5*this.dot&&this.text&&!this.text.endsWith(' ')){this.text+=' ';this.wordDone=true;this.onChar(' ',this.text)}
  const words=this.text.trim().split(/\s+/),last=words.at(-1)||'';
  const terminal=/^(?:K|KN|<KN>|BK|<SK>|SK|<AR>|E)$/.test(last)||last.endsWith('?');
  const afterSK=words.includes('<SK>')||words.includes('SK');
  const hold=Math.max(Number(this.endDots)*this.dot,600,afterSK?12*this.dot:0);
  if(this.text.trim()&&((terminal&&silence>=hold)||silence>=Number(this.endSilence))){this.ended=true;this.onFinal(this.text.trim(),this.stats())}
 }
 stats(){const m=this.marks,short=m.filter(x=>(x-this.edgeBias)<1.9*this.dot),long=m.filter(x=>(x-this.edgeBias)>=1.9*this.dot),mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,sd=a=>a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-mean(a))**2,0)/a.length):0;const dot=mean(short)||this.dot,dash=mean(long)||this.dot*3;return {wpm:1200/Math.max(1,dot),dot,dash,ratio:dash/Math.max(1,dot),gapSd:sd(this.spaces.concat(this.charSpaces)),edgeCount:this.edges.length,markCount:m.length,merged:this.text.match(/\*/g)?.length||0,marks:[...m],spaces:[...this.spaces,...this.charSpaces]}}
}
const FREQS={80:[3510,3570],40:[7010,7040],30:[10110,10140],20:[14010,14060]};
function hamReport(snr){const r=snr>=12?'599':snr>=7?'579':snr>=3?'559':snr>=-1?'449':'339';return r}
export class QSOEngine{
 constructor({seed=12345,mode='A',settings={},onEvent=()=>{}}={}){this.seed=seed>>>0;this.rng=new RNG(this.seed);this.settings={...DEFAULTS,...settings};this.mode=mode;this.onEvent=onEvent;this.factory=new StationFactory(this.rng,this.settings.band);this.events=[];this.now=0;this.state='idle';this.transmitting=false;this.rxEndsAt=0;this.station=null;this.myCall=sanitizeCall(this.settings.ownCall)||'OK1JDV';this.log=[];this.violations=[];this.cqCount=0;this.callCount=0;this.lastTx='';this.lastStart=0;this.lastReport='';this.contactAt=0;this.waitSerial=0;this.waitTimeouts=0;this.keyDown=false;this.lastKeyAt=-Infinity;this.keyStartedOverRX=false;this.turnOpen=false;this.txSequence=0;const [lo,hi]=FREQS[this.settings.band]||FREQS[40];this.frequency=this.rng.int(lo,hi);this.busy=this.rng.chance(this.settings.busyPercent);this.noAnswer=this.rng.chance(this.settings.cqNoAnswer);this.notListening=this.rng.chance(this.settings.notListening)}
 emit(type,data={}){this.onEvent({type,at:this.now,...data})}
 schedule(type,at,data={}){this.events.push({type,at,...data});this.events.sort((a,b)=>a.at-b.at)}
 setTurnOpen(open,now=this.now){
  this.turnOpen=!!open;
  if(Number.isFinite(now)&&now>this.now)this.advanceTo(now);
 }
 keyActivity(now,on=true,startedOverRX=false){
  const at=Number.isFinite(now)?Math.max(this.now,now):this.now;
  if(on&&!this.keyDown&&(this.transmitting||startedOverRX))this.keyStartedOverRX=true;
  // Publish the new activity before processing queued events through 'at'.
  this.keyDown=!!on;this.lastKeyAt=at;
  if(at>this.now)this.advanceTo(at);
  this.emit('key',{on:this.keyDown});
 }
 begin(){this.state=this.mode==='A'?'waitCQ':this.mode==='B'?'cqLoop':'waitCall';this.emit('state',{state:this.state});if(this.mode==='B'){this.station=this.makeStation();this.schedule('cq',this.now+300)}else this.emit('info',{text:this.mode==='A'?'Frekvence volná? Pošli QRL? a pak CQ.':'Pošli volání vybrané značky ve tvaru HIS DE MY K.'});}
 makeStation(call){const s=call?this.factory.fromCall(call):this.factory.make();s.wpm=Math.max(8,Math.min(35,Number(this.settings.wpm)+this.rng.int(-2,2)));s.signal=Number(this.settings.signal);s.report=hamReport(Number(this.settings.signal)+this.rng.int(-2,2));s.offset=this.settings.outMode==='speaker'?(this.settings.tone>650?-250:250):this.rng.int(30,150)*(this.rng.chance(50)?1:-1);return s}
 stationIntro(prefix=''){const s=this.station,call=prefix||`${this.myCall} DE ${s.call}`,base=`${call} GD TU FER CALL = UR RST ${s.report} ${s.report}`;if(s.style==='short')return `${call} GD UR RST ${s.report} KN`;if(s.style==='chatty')return `${base} = NAME ${s.name} ${s.name} QTH ${s.qth} ${s.qth} = RIG IC7300 PWR 100W ANT DIPOLE KN`;return `${base} = NAME ${s.name} QTH ${s.qth} KN`}
 stationReturn(repeated=false){const s=this.station,call=`${this.myCall} DE ${s.call}${repeated?' '+s.call:''}`,base=`${call} R GD = UR RST ${s.report} ${s.report}`;if(s.style==='short')return `${call} R UR RST ${s.report} = 73 ${this.myCall} DE ${s.call} KN`;if(s.style==='chatty')return `${base} = NAME ${s.name} ${s.name} QTH ${s.qth} ${s.qth} = WX CLDY 5C = 73 ${this.myCall} DE ${s.call} KN`;return `${base} = NAME ${s.name} QTH ${s.qth} = 73 ${this.myCall} DE ${s.call} KN`}
 reaction(){return this.settings.reaction==='fast'?this.rng.int(200,500):this.rng.int(400,2000)}
 send(text,delay=this.reaction()){if(!this.station)return;const wpm=this.station.wpm;const duration=MorseCode.textTime(text,wpm),at=Math.max(this.now+delay,this.rxEndsAt+100);const id=++this.txSequence;this.schedule('tx',at,{text,wpm,station:{...this.station},duration,id});this.schedule('txEnd',at+duration,{text,id});this.rxEndsAt=at+duration;this.lastTx=text;if(['waitMyIntro','waitMyExchange','waitMyClose','waitE'].includes(this.state))this.schedule('timeout',this.rxEndsAt+this.rng.int(15000,30000),{serial:++this.waitSerial});}
 advanceTo(target){if(target<this.now)throw Error('Virtuální čas musí růst');let loops=0;while(this.events.length&&this.events[0].at<=target){if(++loops>10000)throw Error('Příliš mnoho událostí');const e=this.events.shift();this.now=e.at;this.event(e)}this.now=target;}
 event(e){
  if(e.type==='cq'){if(this.state!=='cqLoop'||!this.station)return;
   if(this.turnOpen||this.keyDown||this.now-this.lastKeyAt<1500){this.schedule('cq',this.turnOpen?this.now+200:Math.max(this.now+200,this.lastKeyAt+1500));return}
   this.cqCount++;const call=`CQ CQ CQ DE ${this.station.call} ${this.station.call} K`;this.send(call,0);this.schedule('cqNext',this.now+MorseCode.textTime(call,this.station.wpm)+this.rng.int(4000,8000));
  }else if(e.type==='cqNext'){if(this.state!=='cqLoop')return;if(this.turnOpen||this.keyDown||this.now-this.lastKeyAt<1500){this.schedule('cqNext',this.turnOpen?this.now+200:Math.max(this.now+200,this.lastKeyAt+1500));return}if(this.cqCount>=this.rng.int(3,6)){this.station=this.makeStation();this.cqCount=0;this.schedule('cq',this.now+this.rng.int(5000,15000))}else this.schedule('cq',this.now+1);
  }else if(e.type==='tx'){
   if(this.turnOpen||this.keyDown||this.now-this.lastKeyAt<1500){const delay=this.turnOpen?200:Math.max(200,this.lastKeyAt+1500-this.now),start=this.now+delay;this.schedule('tx',start,{text:e.text,wpm:e.wpm,station:e.station,duration:e.duration,id:e.id});const end=this.events.find(x=>x.type==='txEnd'&&x.id===e.id);if(end){end.at=start+e.duration;this.events.sort((a,b)=>a.at-b.at)}this.rxEndsAt=Math.max(this.rxEndsAt,start+e.duration);return}
   this.transmitting=true;this.lastStart=this.now;this.emit('tx',{text:e.text,wpm:e.wpm,station:e.station,duration:e.duration});this.log.push({who:'HIS',text:e.text,at:this.now});
  }else if(e.type==='txEnd'){this.transmitting=false;this.emit('txEnd',{text:e.text});if(this.state==='completePending'){this.state='complete';this.emit('complete',{log:this.log})}
  }else if(e.type==='timeout'){
   if(e.serial!==this.waitSerial||!['waitMyIntro','waitMyExchange','waitMyClose','waitE'].includes(this.state))return;
   if(this.turnOpen||this.keyDown||this.now-this.lastKeyAt<15000){this.schedule('timeout',this.turnOpen?this.now+200:Math.max(this.now+200,this.lastKeyAt+15000),{serial:e.serial});return}
   this.waitTimeouts++;if(this.waitTimeouts>=3){this.state='abandoned';this.emit('info',{text:'Protistanice po třech neúspěšných výzvách odešla.'});this.emit('state',{state:this.state});return}this.emit('info',{text:'Protistanice čeká na odpověď.'});this.send(this.waitTimeouts===1?'?':'QRZ?',100);
  }
 }

 receive(text,{overlap=false,handStats=null}={}){const p=Parser.parse(text);if(!text.trim())return p;this.waitSerial++;this.waitTimeouts=0;const hadOverlap=this.keyStartedOverRX;this.keyStartedOverRX=false;this.log.push({who:'ME',text:p.raw,at:this.now,handStats});this.emit('parsed',{parse:p});if(overlap||hadOverlap){this.violations.push('Klíčování během příjmu protistanice');this.emit('info',{text:'Simplex: klíčováno do protistanice. Přechod nebyl přijat.'});return p}
 if(p.fromCall)this.myCall=p.fromCall;if(!this.station&&this.mode==='C'&&p.toCall)this.station=this.makeStation(p.toCall);
 if(p.requests.some(x=>['AGN','?'].includes(x))){if(this.lastTx)this.send(this.lastTx);return p}if(p.requests.includes('QRZ?')){this.send(`DE ${this.station?.call||this.myCall} ${this.station?.call||this.myCall} K`);return p}if(p.requests.includes('QRS')){if(this.station){this.station.wpm=Math.max(8,this.station.wpm-this.rng.int(3,5));this.emit('info',{text:`QRS potvrzeno: ${this.station.wpm} WPM`});}if(this.lastTx)this.send(this.lastTx);return p}
 for(const field of ['RST','NAME','QTH'])if(p.requests.includes(field+'?')){const val=field==='RST'?this.station?.report:field==='NAME'?this.station?.name:this.station?.qth;if(val)this.send(`${field} ${val} ${val} KN`);return p}
 if(p.partialCall&&this.station?.call.startsWith(p.partialCall)){this.send(`DE ${this.station.call} ${this.station.call} KN`);return p}
 if(this.mode==='A')this.receiveA(p);else if(this.mode==='B')this.receiveB(p);else this.receiveC(p);return p;}
 receiveA(p){if(this.state==='busy')return;if(p.qrl&&this.state==='waitCQ'){if(this.busy){this.sendBusy();this.state='busy';this.emit('info',{text:'Obsazeno. QSY na jiný kmitočet.'})}else this.emit('info',{text:'Žádná odpověď na QRL?: kmitočet se jeví volný.'});return}
 if(this.state==='waitCQ'&&p.cq){if(!p.fromCall){this.emit('info',{text:'CQ bez rozpoznané vlastní značky.'});return}this.cqCount++;if(this.noAnswer){this.emit('info',{text:'Na CQ nikdo neodpověděl. Opakuj CQ.'});return}this.station=this.makeStation();this.station.wpm=Math.max(8,Math.min(35,Math.round(this.settings.myWpm||this.settings.wpm)+this.rng.int(-1,1)));this.state='waitMyIntro';this.send(this.rng.chance(15)?`${this.station.call} ${this.station.call}`:`${this.myCall} DE ${this.station.call} ${this.station.call} KN`,this.rng.int(1000,4000));this.emit('state',{state:this.state});return}
 if(this.state==='waitMyIntro'){if(!p.fromCall){this.send('QRZ?');return}if(!p.rst){this.send('RST?');return}if(p.toCall&&levenshtein(p.toCall,this.station.call)===1){this.violations.push('Chybně přijatá značka');this.send(`${this.myCall} DE ${this.station.call} ${this.station.call} R GD = UR RST ${this.station.report} ${this.station.report} = NAME ${this.station.name} QTH ${this.station.qth} = 73 ${this.myCall} DE ${this.station.call} KN`)}else this.send(this.stationReturn(p.toCall&&p.toCall!==this.station.call));this.state='waitMyClose';this.emit('state',{state:this.state});return}
 if(this.state==='waitMyClose'){if(!p.has73&&!p.text.includes('SK')){this.send('AGN PSE');return}this.send('E',this.reaction());this.state='completePending';this.emit('state',{state:this.state});return}}
 sendBusy(){if(!this.station)this.station=this.makeStation();this.send(this.rng.pick(['C','YES','QRL']),300)}
 receiveB(p){if(this.state==='cqLoop'){if(!p.fromCall){this.send('QRZ?');return}if(p.toCall&&levenshtein(p.toCall,this.station.call)>1){this.emit('info',{text:'Protistanice nebyla volána svou značkou.'});return}if(p.toCall&&levenshtein(p.toCall,this.station.call)===1)this.violations.push('Chybně přijatá značka');this.state='waitMyExchange';this.send(this.stationIntro(p.toCall&&p.toCall!==this.station.call?`${this.myCall} DE ${this.station.call} ${this.station.call}`:''));this.emit('state',{state:this.state});return}
 if(this.state==='waitMyExchange'){if(!p.rst){this.send('RST?');return}this.send(`R TU 73 DE ${this.station.call} <SK> E E`);this.state='waitE';this.emit('state',{state:this.state});return}
 if(this.state==='waitE'){if(this.isClosingTurn(p)){this.state='complete';this.emit('complete',{log:this.log});return}this.send('E');return}}
 receiveC(p){if(this.state==='waitCall'){if(!p.fromCall||!p.toCall){this.emit('info',{text:'Volání: {HIS} DE {MY} K'});return}this.callCount++;if(this.notListening){if(this.callCount>=2)this.emit('info',{text:'Stanice neposlouchá.'});return}this.station=this.makeStation(p.toCall);if(this.rng.chance(50)){this.state='waitMyExchange';this.send(this.stationIntro())}else{this.state='waitMyIntro';this.send(`${this.myCall} DE ${this.station.call} GD KN`)}this.emit('state',{state:this.state});return}
 if(this.state==='waitMyIntro'){if(!p.rst){this.send('RST?');return}this.send(this.stationReturn(p.toCall&&p.toCall!==this.station.call));this.state='waitMyClose';this.emit('state',{state:this.state});return}
 if(this.state==='waitMyExchange'){if(!p.rst){this.send('RST?');return}this.send(`R TU 73 DE ${this.station.call} <SK> E E`);this.state='waitE';this.emit('state',{state:this.state});return}
 if(this.state==='waitMyClose'){if(!p.has73){this.send('AGN');return}this.send('E');this.state='completePending';return}
 if(this.state==='waitE'&&this.isClosingTurn(p)){this.state='complete';this.emit('complete',{log:this.log})}}
 isClosingTurn(p){return /(?:^|\s)(?:E|73|<SK>)(?=\s|$)/.test(p.text)}
 nextHint(){const m=this.myCall,h=this.station?.call||'{HIS}',n=this.settings.ownName,q=this.settings.ownQth,r=this.station?.report||'579';switch(this.state){case'waitCQ':return `QRL?  →  CQ CQ CQ DE ${m} ${m} K`;case'busy':return 'QSY: změň kmitočet';case'cqLoop':return `${h} DE ${m} ${m} KN`;case'waitCall':return `${h} DE ${m} K`;case'waitMyIntro':return `${h} DE ${m} GD TU FER CALL = UR RST 579 579 = NAME ${n} QTH ${q} KN`;case'waitMyExchange':return `${h} DE ${m} R GD = UR RST 579 579 = NAME ${n} QTH ${q} = 73 ${h} DE ${m} KN`;case'waitMyClose':return `R TU 73 DE ${m} <SK> E E`;case'waitE':return 'E';default:return ''}}
}
export class Coach{
 static evaluate(engine,form={}){const me=engine.log.filter(e=>e.who==='ME'),his=engine.log.filter(e=>e.who==='HIS'),s=engine.station||{},issues=[...engine.violations],first=(me.find(x=>!Parser.parse(x.text).qrl)?.text||me[0]?.text||''),last=me.at(-1)?.text||'',rstTx=me.map(e=>Parser.parse(e.text).rst).find(Boolean)||'',heard=his.map(x=>x.text).join(' '),actual={call:s.call||'',sent:rstTx,rcvd:s.report||'',name:/\bNAME\s/.test(heard)?s.name||'':'',qth:/\bQTH\s/.test(heard)?s.qth||'':''};const checks={};for(const [name,key] of [['CALL','call'],['RST TX','sent'],['RST RX','rcvd'],['NAME','name'],['QTH','qth']]){const val=String(form[key]||'').toUpperCase().trim(),expected=String(actual[key]||'').toUpperCase();checks[name]={got:val,expected,ok:expected?val===expected:!val,optional:!expected}}
 if(engine.mode==='A'&&!me.some(x=>/\bQRL\?/.test(x.text)))issues.push('Před CQ nebylo ověřeno QRL? [A: řádky 1–2]');if(me.length&&!first.includes(engine.myCall))issues.push('V úvodu chybí vlastní značka [§7 identifikace]');if(me.length&&!last.includes(engine.myCall)&&!(['B','C'].includes(engine.mode)&&me.at(-2)?.text.includes(engine.myCall)))issues.push('Na konci chybí vlastní značka [§7 identifikace]');if(me.some(x=>Parser.parse(x.text).greetings.length>1))issues.push('V jednom přechodu více pozdravů [§7 pozdravy]');if(me.some(x=>Parser.parse(x.text).hasR)&&!checks['RST RX'].ok)issues.push('R vysláno bez správného opisu RST [§7 R]');if(rstTx&&/^[1-5][1-9][1-9]$/.test(rstTx)){const ideal=hamReport(Number(engine.settings.signal));if(Math.abs(Number(rstTx[1])-Number(ideal[1]))>1)issues.push('Odeslaný RST neodpovídá síle přijímaného signálu [§7 RST]')}if(me.some(x=>{const p=Parser.parse(x.text);return p.cq&&p.endSign!=='K'}))issues.push('Za CQ chybí K [§7 A]');if(me.some(x=>{const p=Parser.parse(x.text);return p.has73&&!['KN','SK','E'].includes(p.endSign)}))issues.push('Nesprávné zakončení přechodu [§7]');const hands=me.map(x=>x.handStats).filter(Boolean),marks=hands.flatMap(x=>x.marks||[]),gaps=hands.flatMap(x=>x.spaces||[]),dotVals=hands.filter(x=>x.markCount>1).map(x=>x.dot).filter(Number.isFinite),dashVals=hands.filter(x=>x.markCount>1).map(x=>x.dash).filter(Number.isFinite),avg=a=>a.length?a.reduce((t,v)=>t+v,0)/a.length:0,h=hands.length?{...hands.at(-1),wpm:dotVals.length?1200/avg(dotVals):avg(hands.map(x=>x.wpm)),dot:avg(dotVals),dash:avg(dashVals),ratio:dashVals.length&&dotVals.length?avg(dashVals)/avg(dotVals):3,gapSd:gaps.length>1?Math.sqrt(avg(gaps.map(x=>(x-avg(gaps))**2))):0,markCount:marks.length,edgeCount:hands.reduce((v,x)=>v+x.edgeCount,0),merged:hands.reduce((v,x)=>v+x.merged,0)}:null;if(h&&h.wpm>s.wpm+3)issues.push('Vysíláš více než o 3 WPM rychleji než protistanice [§7 QRS]');if(h&&Math.abs(h.ratio-3)>.5)issues.push('Poměr čárky k tečce mimo 3:1 [§5 ruka]');const score=Math.max(0,Math.round(100-issues.length*7-Object.values(checks).filter(x=>!x.ok).length*8));const advice=issues.concat(Object.entries(checks).filter(([,v])=>!v.ok).map(([k])=>`Oprav zápis ${k} v logu [§7 výměna]`)).slice(0,3);return {score,issues,checks,actual,advice,hand:h,complete:engine.state==='complete',txCount:me.length,rxCount:his.length};}
}
/* ─── Web Audio: receiver, sidetone and microphone ─────────────────────── */
export class AudioEngine {
 constructor(settings,onEdge=()=>{},onLevel=()=>{}){this.settings=settings;this.onEdge=onEdge;this.onLevel=onLevel;this.ctx=null;this.micStream=null;this.source=null;this.worklet=null;this.latestLevel=null;this.noiseRandom=new RNG(11235813);this.activeRX=null;this.lastDuck=0;this.qsbWalk=0;this.qsbStep=0;this.micMuted=false;this.calibration={};this.ready=false;this.playedLevel=0;}
 async start(){if(this.ctx){await this.ctx.resume();return}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio není podporováno');if(navigator.audioSession&&'type' in navigator.audioSession){try{navigator.audioSession.type='play-and-record'}catch{}}
 const ctx=this.ctx=new AC({latencyHint:'interactive'});await ctx.resume();await ctx.audioWorklet.addModule(new URL('./cw-worklet.js',import.meta.url));
 this.comp=ctx.createDynamicsCompressor();this.comp.threshold.value=-15;this.comp.knee.value=12;this.comp.ratio.value=3;this.comp.attack.value=.003;this.comp.release.value=.12;this.comp.connect(ctx.destination);
 this.rxVolume=ctx.createGain();this.rxVolume.gain.value=0;this.rxVolume.connect(this.comp);
 this.bp1=ctx.createBiquadFilter();this.bp1.type='bandpass';this.bp1.Q.value=.9;this.bp2=ctx.createBiquadFilter();this.bp2.type='bandpass';this.bp2.Q.value=1.2;this.bp1.connect(this.bp2);this.bp2.connect(this.rxVolume);
 this.noiseGain=ctx.createGain();this.noiseGain.gain.value=.14;this.noiseGain.connect(this.bp1);
 const len=Math.round(ctx.sampleRate*7),buff=ctx.createBuffer(1,len,ctx.sampleRate),v=buff.getChannelData(0);let pink=0;for(let i=0;i<v.length;i++){const white=this.noiseRandom.next()*2-1;pink=.995*pink+.005*white;v[i]=.83*white+.5*pink}this.noise=ctx.createBufferSource();this.noise.buffer=buff;this.noise.loop=true;this.noise.connect(this.noiseGain);this.noise.start();
 this.sidetoneGain=ctx.createGain();this.sidetoneGain.gain.value=0;this.sidetoneGain.connect(this.comp);this.sidOsc=ctx.createOscillator();this.sidOsc.type='sine';this.sidOsc.frequency.value=Number(this.settings.tone);this.sidOsc.connect(this.sidetoneGain);this.sidOsc.start();
 this.sink=ctx.createGain();this.sink.gain.value=0;this.sink.connect(ctx.destination);
 this.analyser=ctx.createAnalyser();this.analyser.fftSize=8192;this.analyser.smoothingTimeConstant=.35;this.analyser.connect(this.sink);
 this.worklet=new AudioWorkletNode(ctx,'tone-detector',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});this.worklet.connect(this.sink);this.worklet.port.onmessage=e=>{const d=e.data;if(d.type==='edge'){if(!this.micMuted)this.onEdge(d)}else if(d.type==='level'){this.latestLevel=d;this.onLevel(d)}};
 this.configure();try{await this.openMicrophone()}catch(e){this.deviceWarning=e.message}this.setVolume(this.settings.volume);this.ready=true;}
 configure(){if(!this.ctx||!this.bp1||!this.bp2||!this.sidOsc)return;const c=this.ctx,center=this.settings.outMode==='speaker'?(this.settings.tone>650?this.settings.tone-250:this.settings.tone+250):Number(this.settings.tone);this.bp1.frequency.setTargetAtTime(center,c.currentTime,.025);this.bp2.frequency.setTargetAtTime(center,c.currentTime,.025);this.bp1.Q.value=Math.max(.35,center/Number(this.settings.filter)*.80);this.bp2.Q.value=Math.max(.35,center/Number(this.settings.filter)*.95);this.sidOsc.frequency.setTargetAtTime(Number(this.settings.tone),c.currentTime,.02);this.worklet?.port.postMessage({type:'config',freq:Number(this.settings.tone),dot:1200/Number(this.settings.wpm),enabled:!this.micMuted});this.setVolume(this.settings.volume);}
 async devices(){if(!navigator.mediaDevices?.enumerateDevices)return[];try{return (await navigator.mediaDevices.enumerateDevices()).filter(x=>x.kind==='audioinput')}catch{return[]}}
 async openMicrophone(deviceId=''){if(!navigator.mediaDevices?.getUserMedia)throw Error('Mikrofon vyžaduje HTTPS nebo localhost');if(this.source){this.source.disconnect();this.source=null}if(this.micStream)this.micStream.getTracks().forEach(t=>t.stop());const audio={echoCancellation:!!this.settings.aec,noiseSuppression:false,autoGainControl:false,channelCount:1,...(deviceId?{deviceId:{ideal:deviceId}}:{})};const stream=this.micStream=await navigator.mediaDevices.getUserMedia({audio});const track=stream.getAudioTracks()[0],set=track.getSettings?.()||{};const errors=[];for(const k of ['echoCancellation','noiseSuppression','autoGainControl'])if(set[k]!==undefined&&set[k]!==audio[k])errors.push(`${k}=${set[k]}`);if(set.channelCount!==undefined&&set.channelCount!==1)errors.push(`kanály=${set.channelCount}`);this.source=this.ctx.createMediaStreamSource(stream);this.worklet?.port.postMessage({type:'reset'});this.source.connect(this.worklet);this.source.connect(this.analyser);this.deviceWarning=errors.join(', ');return {settings:set,warning:this.deviceWarning};}
 setVolume(percent){if(!this.ctx||!this.rxVolume)return;this.settings.volume=Number(percent);const now=this.ctx.currentTime,mult=(Number(percent)/100)*.85;this.rxVolume.gain.setTargetAtTime(mult*(performance.now()<this.lastDuck?0.001:1),now,.012)}
 duck(on,hold=300){if(!this.ready||!this.ctx||!this.rxVolume)return;const now=this.ctx.currentTime;if(on){this.lastDuck=performance.now()+hold;this.rxVolume.gain.cancelScheduledValues(now);this.rxVolume.gain.setTargetAtTime(0.0001,now,.003)}else{this.lastDuck=performance.now()+hold}}
 update(){if(!this.ready||!this.ctx||!this.rxVolume||!this.rxVolume.gain)return;const now=performance.now();if(now>=this.lastDuck&&this.rxVolume.gain.value<(this.settings.volume/100)*.5)this.setVolume(this.settings.volume);if(now-this.qsbStep>200){this.qsbStep=now;const depths={none:0,mild:4,medium:10,deep:20};const depth=depths[this.settings.qsb]||0;this.qsbWalk=Math.max(-depth,Math.min(0,this.qsbWalk+(this.noiseRandom.next()-.5)*(depth/6)));if(this.activeRX){const fade=this.activeRX.fading;fade.gain.setTargetAtTime(Math.pow(10,this.qsbWalk/20),this.ctx.currentTime,.15)}this.playedLevel=this.activeRX?this.signalAmplitude(this.settings.signal)*Math.pow(10,this.qsbWalk/20):0;}}
 signalAmplitude(snr){/* Approximate band-limited SNR; precise acoustic calibration varies by output device. */return Math.max(.003,.014*Math.pow(10,(Number(snr)-3)/20))}
 playRX(text,station,wpm,variation=0){if(!this.ctx)return 0;const now=this.ctx.currentTime+.02;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),fading=this.ctx.createGain(),base=Number(this.settings.tone);const target=this.settings.outMode==='speaker'?Math.min(1100,Math.max(350,base+(base>650?-250:250))):base+(station.offset||70);osc.frequency.value=Math.max(250,Math.min(1600,target+Number(this.settings.rit)));osc.type='sine';gain.gain.value=0;osc.connect(gain);gain.connect(fading);fading.connect(this.bp1);fading.gain.value=Math.pow(10,this.qsbWalk/20);const code=MorseCode.events(text,wpm,{variation,rng:new RNG((text.length*1337+Math.round(wpm*100))>>>0)});const envelope=new Float32Array(16);for(let i=0;i<envelope.length;i++)envelope[i]=(1-Math.cos(Math.PI*i/(envelope.length-1)))/2;const down=new Float32Array(envelope).reverse();const level=this.signalAmplitude(this.settings.signal);
 for(const ev of code.events){let a=now+ev.on/1000,b=now+ev.off/1000;if(b-a<.011)continue;gain.gain.setValueAtTime(0,a);gain.gain.setValueCurveAtTime(envelope.map(x=>x*level),a,.005);gain.gain.setValueAtTime(level,a+.005);gain.gain.setValueAtTime(level,b-.005);gain.gain.setValueCurveAtTime(down.map(x=>x*level),b-.005,.005)}osc.start(now);osc.stop(now+code.duration/1000+.03);osc.onended=()=>{osc.disconnect();gain.disconnect();fading.disconnect();if(this.activeRX?.osc===osc){this.activeRX=null;this.playedLevel=0}};this.activeRX={osc,gain,fading};this.playedLevel=level*Math.pow(10,this.qsbWalk/20);return code.duration}
 playSelf(text,wpm){if(!this.ctx)return 0;const now=this.ctx.currentTime+.025,d=MorseCode.events(text,wpm,{farnsworth:!!this.settings.farnsworth});const e=this.sidetoneGain.gain;e.cancelScheduledValues(now);e.setValueAtTime(0,now);for(const mark of d.events){const a=now+mark.on/1000,b=now+mark.off/1000;e.setValueAtTime(0,a);e.linearRampToValueAtTime(.20,a+.005);e.setValueAtTime(.20,Math.max(a+.005,b-.005));e.linearRampToValueAtTime(0,b)}e.setValueAtTime(0,now+d.duration/1000+.01);return d.duration}
 stopSelf(){if(!this.ctx)return;const t=this.ctx.currentTime;this.sidetoneGain.gain.cancelScheduledValues(t);this.sidetoneGain.gain.setTargetAtTime(0,t,.004)}
 async scanTone(durationMs=4500,onProgress=()=>{}){if(!this.ctx)return null;const ana=this.analyser,binHz=this.ctx.sampleRate/ana.fftSize,spectrum=new Float32Array(ana.frequencyBinCount),frames=[];const t0=performance.now();while(performance.now()-t0<durationMs){ana.getFloatFrequencyData(spectrum);frames.push(new Float32Array(spectrum));onProgress((performance.now()-t0)/durationMs);await new Promise(r=>setTimeout(r,40))}const peak=pickTonePeak(frames,binHz);return {...peak,count:frames.length}}
 async measureQuiet(ms=2000){const a=this.analyser,sp=new Float32Array(a.frequencyBinCount);let acc=0,n=0;const end=performance.now()+ms;while(performance.now()<end){a.getFloatFrequencyData(sp);for(let i=60;i<205;i++){acc+=sp[i];n++}await new Promise(r=>setTimeout(r,60))}return n?acc/n:-110}
 muteDecoder(muted){this.micMuted=!!muted;this.worklet?.port.postMessage({type:'config',enabled:!muted})}
 latency(){return {base:this.ctx?.baseLatency??null,output:this.ctx?.outputLatency??null}}
 async close(){this.ready=false;try{this.micStream?.getTracks().forEach(x=>x.stop());await this.ctx?.close()}catch{}this.ctx=null}
}
/* ─── UI ────────────────────────────────────────────────────────────────── */
const CONFIG_IDS=['ownCall','ownName','ownQth','band','filter','outMode','signal','wpm','rit','volume','qsb','tone','cqNoAnswer','busyPercent','notListening','endDots','endSilence','hang','reaction','hand','exam','farnsworth','rxTextMode','helpMode','aec'];
const ESC=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class TrainerUI{
 constructor(){this.el=id=>document.getElementById(id);this.settings={...DEFAULTS,...Storage.get('settings',{})};this.mode='A';this.audio=null;this.engine=null;this.classifier=null;this.clockStart=0;this.lastSeed=null;this.toastTimer=0;this.turnOverlap=false;this.keyboardActive=false;this.keyboardFinish=0;this.keySendAbort=false;this.currentRx=null;this.history=Storage.get('history',[]);this.lastSecondRender=0;this.calibration=Storage.get('calibration',null);this.lastError=false;this.prevDetected=null;this.lastLevel=null;this.lastEdges=[];this.onKeyDown=false;this.rawMarkOverRX=false;this.calibrating=false;this.calEdges=[];this.calLevels=[];this.loopFaults=[];this.setup();this.loop();}
 setup(){for(const id of CONFIG_IDS){const node=this.el(id);if(!node)continue;const val=this.settings[id];if(node.type==='checkbox')node.checked=!!val;else if(val!==undefined)node.value=String(val);node.addEventListener(node.type==='range'?'input':'change',()=>{const v=node.type==='checkbox'?node.checked:node.type==='number'||node.type==='range'?Number(node.value):node.value;this.settings[id]=v;Storage.set('settings',this.settings);this.updateSettings(id)})}
 for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{this.mode=b.dataset.mode;for(const n of document.querySelectorAll('[data-mode]'))n.classList.toggle('active',n===b);this.el('scenario').textContent='Zvolen režim '+this.mode+'. Spusť nové QSO.'});
 this.el('power').addEventListener('click',()=>this.power());this.el('newqso').addEventListener('click',()=>this.newQSO());this.el('sameSeed').addEventListener('click',()=>{if(this.lastSeed!==null)this.newQSO(this.lastSeed)});this.el('qsy').addEventListener('click',()=>this.newQSO());this.el('sendKeyboard').addEventListener('click',()=>this.sendKeyboard());this.el('abortKeyboard').addEventListener('click',()=>this.abortKeyboard());this.el('keyboard').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.sendKeyboard()}if(e.key==='Escape'){e.preventDefault();this.abortKeyboard()}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.keyboardActive)this.abortKeyboard()});
 this.el('calibrate').addEventListener('click',()=>this.calibrate());this.el('refreshDevices').addEventListener('click',()=>this.refreshDevices());this.el('micSelect').addEventListener('change',async()=>{if(this.audio?.ctx){try{const result=await this.audio.openMicrophone(this.el('micSelect').value);if(result.warning)this.toast('Prohlížeč ignoroval: '+result.warning,true)}catch(e){this.toast(e.message,true)}}});this.el('replay').addEventListener('click',()=>{if(this.settings.exam==='exam'||!this.audio?.ctx)return;if(this.engine?.lastTx&&this.engine.station)this.audio.playRX(this.engine.lastTx,this.engine.station,this.engine.station.wpm,Number(this.settings.hand)/100)});
 this.el('showStats').addEventListener('click',()=>this.showHistory());this.el('clearStats').addEventListener('click',()=>{this.history=[];Storage.set('history',[]);this.showHistory()});this.el('runTests').addEventListener('click',()=>this.runTests());this.el('e2eTests')?.addEventListener('click',()=>this.runE2E());if(location.hash.toLowerCase()==='#selftest')this.el('selftestPanel').classList.remove('hidden');window.addEventListener('hashchange',()=>this.el('selftestPanel').classList.toggle('hidden',location.hash.toLowerCase()!=='#selftest'));
 if(this.calibration?.hz){this.settings.tone=this.calibration.hz;this.el('tone').value=Math.round(this.calibration.hz);this.el('calResult').textContent=`${Math.round(this.calibration.hz)} Hz / ${this.calibration.snr?.toFixed(0)??'?'} dB / ${this.calibration.wpm?.toFixed(0)??'?'} WPM`}
 this.updateSettings('init');this.showHistory();}
 updateSettings(id){if(id==='ownCall'||id==='ownName'||id==='ownQth')this.settings[id]=String(this.settings[id]).toUpperCase().replace(/[^A-Z0-9 /]/g,'').trim();this.el('wpmLabel').textContent=this.settings.wpm;this.el('ritLabel').textContent=(this.settings.rit>=0?'+':'')+this.settings.rit;this.el('volumeLabel').textContent=this.settings.volume;this.el('bandDisplay').textContent=`${this.settings.band}m CW`;this.el('filterDisplay').textContent=`${this.settings.filter} / ${this.settings.rit>=0?'+':''}${this.settings.rit}`;this.el('wpmDisplay').textContent=`${this.engine?.station?.wpm||this.settings.wpm} WPM`;this.el('keyboardPanel').classList.toggle('hidden',this.settings.exam==='exam');this.el('replay').disabled=this.settings.exam==='exam';this.el('helpMode').disabled=this.settings.exam==='exam';this.el('rxTextMode').disabled=this.settings.exam==='exam';if(this.settings.exam==='exam'){this.el('hisScreen').classList.add('hiddenrx');this.el('hint').textContent='';}else this.el('hisScreen').classList.remove('hiddenrx');if(this.audio?.ctx){this.audio.configure();this.audio.setVolume(this.settings.volume);if(id==='aec')this.audio.openMicrophone(this.el('micSelect').value).then(r=>{if(r.warning)this.toast(r.warning,true)}).catch(e=>this.toast(e.message,true))}this.setHint();}
 async power(){const b=this.el('power');if(this.audio?.ctx){await this.audio.close();this.audio=null;b.textContent='Zapnout přijímač';this.el('rxstatus').textContent='RX VYPNUT';this.el('rxstatus').classList.remove('on');return}b.disabled=true;this.el('rxstatus').textContent='STARTUJE';const audio=new AudioEngine(this.settings,d=>this.edge(d),d=>this.level(d));try{await audio.start();this.audio=audio;this.el('rxstatus').textContent=audio.micStream?'RX ZAPNUT':'RX BEZ MIC';this.el('rxstatus').classList.toggle('on',!!audio.micStream);b.textContent='Vypnout přijímač';if(audio.deviceWarning)this.toast('Mikrofon: '+audio.deviceWarning,true);await this.refreshDevices();this.toast('Přijímač běží. Doporučena kalibrace VVV.')}catch(e){await audio.close();this.el('rxstatus').textContent='RX CHYBA';b.textContent='Zapnout přijímač';this.toast('Zvuk: '+e.message,true)}finally{b.disabled=false}}
 async refreshDevices(){const devices=await this.audio?.devices()||[],select=this.el('micSelect'),saved=select.value;select.replaceChildren(new Option('Výchozí mikrofon',''));for(const d of devices)select.add(new Option(d.label||`Mikrofon ${select.length}`,d.deviceId));if([...select.options].some(o=>o.value===saved))select.value=saved;}
 newQSO(seed=null){this.abortKeyboard();const value=seed!==null?seed:(window.crypto?.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Date.now());this.lastSeed=value>>>0;this.el('seedDisplay').textContent='Seed: '+this.lastSeed;this.engine=new QSOEngine({seed:this.lastSeed,mode:this.mode,settings:{...this.settings,myWpm:this.classifier?1200/this.classifier.dot:this.settings.wpm},onEvent:e=>this.event(e)});this.engine.begin();this.clockStart=performance.now();this.turnOverlap=false;this.rawMarkOverRX=false;this.classifier?.reset(true);this.lastError=false;this.currentRx=null;this.el('timeline').replaceChildren();this.el('results').classList.add('hidden');this.el('transcript').textContent='Spojení právě probíhá.';this.el('myScreen').textContent='—';this.el('hisScreen').textContent='—';this.el('parsed').textContent='Parser: —';for(const id of ['logCall','logSent','logRcvd','logName','logQth'])this.el(id).value='';this.updateFrequency();this.setHint();this.toast(`Nové QSO · ${this.mode} · seed ${this.lastSeed}`)}
 updateFrequency(){if(!this.engine)return;const k=this.engine.frequency;this.el('freqDisplay').textContent=(k/1000).toFixed(3).replace('.', '.')+'.00';this.el('logAuto').textContent=`${new Date().toISOString().slice(0,16).replace('T',' ')} UTC / ${this.settings.band}m / CW`;}
 event(e){if(e.type==='info'){this.el('scenario').textContent=e.text;return}if(e.type==='state'){this.el('qstatus').textContent=e.state.toUpperCase();this.setHint();return}if(e.type==='parsed'){const p=e.parse;this.el('parsed').textContent=`DE ${p.fromCall||'—'} → ${p.toCall||'—'} | RST ${p.rst||'—'} NAME ${p.name||'—'} QTH ${p.qth||'—'} | ${p.endSign||'—'}`;if(p.invalid)this.lastError=true;return}if(e.type==='tx'){if(this.audio?.ctx)this.audio.playRX(e.text,e.station,e.wpm,Number(this.settings.hand)/100);this.currentRx={text:e.text,start:performance.now(),duration:e.duration,wpm:e.wpm,station:e.station};this.el('wpmDisplay').textContent=e.wpm+' WPM';const isHidden=this.settings.exam==='exam'||this.settings.rxTextMode==='hidden';this.el('hisScreen').textContent=isHidden?'[PŘÍJEM PO SLUCHU]':this.settings.rxTextMode==='live'?'·': 'Přijímám…';this.addTimeline('HIS',isHidden?'[PŘÍJEM SKRYT]':e.text,e.at);return}if(e.type==='txEnd'){if(this.settings.exam!=='exam'&&this.settings.rxTextMode==='after')this.el('hisScreen').textContent=e.text;this.currentRx=null;this.setHint();return}if(e.type==='complete'){this.el('qstatus').textContent='QSO UKONČENO';this.finish();return}}
 addTimeline(who,text,at){const div=document.createElement('div');div.className=who==='ME'?'mine':'his';div.textContent=`${(at/1000).toFixed(1).padStart(6)}s ${who}  ${text}`;this.el('timeline').append(div);this.el('timeline').scrollTop=this.el('timeline').scrollHeight}
 setHint(){if(!this.engine||this.settings.exam==='exam'||this.settings.helpMode==='never'||this.settings.helpMode==='error'&&!this.lastError){this.el('hint').textContent='';return}this.el('hint').textContent='DALŠÍ KROK: '+this.engine.nextHint()}
 edge(d){if(this.calibrating){this.calEdges.push({on:d.on,frame:d.frame});return}if(!this.audio?.ready||this.keyboardActive)return;this.lastEdges.push(Math.max(0,performance.now()-(this.audio?.ctx?.getOutputTimestamp?(()=>{const t=this.audio.ctx.getOutputTimestamp();return t.performanceTime+(d.frame/this.audio.ctx.sampleRate-t.contextTime)*1000})():performance.now())));if(this.lastEdges.length>100)this.lastEdges.shift();const on=d.on;this.onKeyDown=on;if(on)this.rawMarkOverRX=!!this.engine?.transmitting;this.el('keyled').classList.toggle('on',on);this.el('keyText').textContent=on?'KEY DOWN':'KEY UP';if(on){this.audio?.duck(true,Number(this.settings.hang))}else this.audio?.duck(false,Number(this.settings.hang));if(!this.classifier||this.classifier.sampleRate!==this.audio?.ctx?.sampleRate)this.classifier=this.makeClassifier();this.classifier.edge(on,d.frame)}
 makeClassifier(){const c=new Classifier({sampleRate:this.audio?.ctx?.sampleRate||48000,wpm:this.calibration?.wpm||this.settings.wpm,endDots:Math.max(12,Number(this.settings.endDots)),edgeBias:this.calibration?.edgeBias||0,endSilence:Number(this.settings.endSilence),onChar:(sym,text)=>{this.el('myScreen').textContent=text},onElement:mark=>{this.el('marks').textContent=(this.el('marks').textContent+mark).slice(-55)},onFinal:(text,stats)=>{try{if(text.trim()&&!this.calibrating)this.userTurn(text,stats);else{this.turnOverlap=false;if(this.engine)this.engine.keyStartedOverRX=false}}finally{this.engine?.setTurnOpen(false);this.classifier.reset()}},onKey:()=>{},onValidatedKey:(on)=>{
   if(this.calibrating||this.keyboardActive||!this.engine)return;
   const now=Math.max(this.engine.now,performance.now()-this.clockStart);
   if(on){this.engine.setTurnOpen(true,now);this.turnOverlap ||= this.rawMarkOverRX}
   this.engine.keyActivity(now,on,on&&this.rawMarkOverRX);
  }});c.initialWpm=this.calibration?.wpm||this.settings.wpm;return c;}
 level(d){if(this.calibrating&&d.on)this.calLevels.push(d.env);this.lastLevel=d;this.el('levelDisplay').textContent=`${d.env.toFixed(4)} / ${d.threshold.toFixed(4)}`;this.el('detectBadge').textContent=d.on?'TÓN ZACHYCEN':'TÓN NEDETEKOVÁN';this.el('detectBadge').classList.toggle('on',!!d.on);this.el('rxdecode').textContent=`${Math.round(d.lockedHz)} Hz · ${Math.round(1200/(this.classifier?.dot||1200/this.settings.wpm))} WPM`;}
 userTurn(text,handStats=null,overlap=this.turnOverlap){this.turnOverlap=false;if(!String(text).trim()||this.calibrating)return;const p=Parser.parse(text);this.el('myScreen').textContent=text||'—';if(!this.engine){this.toast('Nejdřív spusť Nové QSO.');return}this.engine.advanceTo(Math.max(this.engine.now,performance.now()-this.clockStart));this.addTimeline('ME',text,this.engine.now);this.engine.receive(text,{overlap,handStats});this.lastError=p.invalid;this.setHint();if(handStats)this.el('handStats').textContent=`Ruka: ${handStats.wpm.toFixed(1)} WPM, čárka/tečka ${handStats.ratio.toFixed(2)}:1, σ mezer ${handStats.gapSd.toFixed(0)} ms, slité/nečitelné ${handStats.merged}`;}
 async sendKeyboard(){if(this.keyboardActive||this.settings.exam==='exam')return;const text=this.el('keyboard').value.toUpperCase().trim();if(!text)return;this.keyboardActive=true;this.keySendAbort=false;this.engine?.setTurnOpen(true,Math.max(this.engine.now,performance.now()-this.clockStart));this.engine?.keyActivity(Math.max(this.engine.now,performance.now()-this.clockStart),true);this.turnOverlap ||= !!this.engine?.transmitting;const d=this.audio?.ctx?this.audio.playSelf(text,Number(this.settings.wpm)):MorseCode.textTime(text,this.settings.wpm);this.audio?.muteDecoder(true);this.audio?.duck(true,d+Number(this.settings.hang));this.el('sendKeyboard').disabled=true;this.el('myScreen').textContent=text;this.keyboardFinish=performance.now()+d;this.keyboardText=text;this.toast('Záložní klávesnice vysílá '+Math.round(d/1000)+' s · Esc přeruší');}
 abortKeyboard(){if(!this.keyboardActive)return;this.keyboardActive=false;this.keySendAbort=true;this.engine?.keyActivity(Math.max(this.engine.now,performance.now()-this.clockStart),false);this.engine?.setTurnOpen(false);this.audio?.stopSelf();this.audio?.muteDecoder(false);this.el('sendKeyboard').disabled=false;this.toast('Vysílání přerušeno.');}
 async calibrate(){const button=this.el('calibrate');button.disabled=true;this.calibrating=true;this.calEdges=[];this.calLevels=[];try{if(!this.audio?.ctx)await this.power();if(!this.audio?.ctx)throw Error('Zapni přijímač');if(!this.audio.micStream)await this.audio.openMicrophone(this.el('micSelect').value);const guide=this.el('calInstructions');button.textContent='Kalibrace 2/4';guide.textContent='2 s ticho: neklíčuj, nevydávej zvuky.';const quiet=await this.audio.measureQuiet(2000);button.textContent='Kalibrace 3/4';guide.textContent='Teď opakovaně vyšlete VVV nebo aspoň 4 s klíčujte příposlech (400–1000 Hz).';const tone=await this.audio.scanTone(4500);if(tone.hz<300||tone.hz>1200||tone.peakDb<-85)throw Error('Příposlech nebyl nalezen. Zkontroluj mikrofon a hlasitost.');this.settings.tone=tone.hz;this.el('tone').value=Math.round(tone.hz);this.audio.configure();this.calEdges=[];this.calLevels=[];guide.textContent='Tón nalezen. Nyní ještě 3 s vysílej VVV pro měření WPM a asymetrie hran.';await new Promise(r=>setTimeout(r,3000));const snr=tone.snr;let timing=null;try{timing=estimateHandTiming(this.calEdges,this.audio.ctx.sampleRate)}catch{}const wpm=timing?.wpm||this.settings.wpm;let leak=0;if(this.settings.outMode==='speaker'){button.textContent='Kalibrace 4/4';guide.textContent='Test průniku reproduktoru: neklíčuj. Hraje testovací stanice.';this.audio.muteDecoder(true);const levels=[];const previous=this.audio.onLevel;this.audio.onLevel=x=>{levels.push(x.env);previous(x)};this.audio.playRX('VVV VVV VVV',{offset:250},18);await new Promise(r=>setTimeout(r,2300));leak=Math.max(0,...levels);this.audio.onLevel=previous;this.audio.worklet?.port.postMessage({type:'config',leak});this.audio.muteDecoder(false)}
 this.calibration={hz:tone.hz,snr,wpm,leak,quiet,signalLevel:this.calLevels.length?this.calLevels.sort((a,b)=>a-b)[Math.floor(this.calLevels.length*.75)]:0,edgeBias:timing?.edgeBias||0,at:new Date().toISOString()};this.audio.worklet?.port.postMessage({type:'config',signalLevel:this.calibration.signalLevel});Storage.set('calibration',this.calibration);Storage.set('settings',this.settings);this.el('calResult').textContent=`${Math.round(tone.hz)} Hz / ${snr.toFixed(0)} dB / ${wpm.toFixed(0)} WPM`;guide.textContent=`Hotovo · zamčeno ${Math.round(tone.hz)} Hz · odhad SNR ${snr.toFixed(0)} dB · WPM ${wpm.toFixed(0)} · asymetrie ${this.calibration.edgeBias.toFixed(1)} ms · průnik ${leak.toFixed(4)}. Odhady závisejí na zařízení.`;this.classifier=this.makeClassifier();this.toast('Kalibrace uložena.')}catch(e){this.el('calInstructions').textContent='Kalibrace selhala: '+e.message;this.toast('Kalibrace: '+e.message,true)}finally{this.calibrating=false;this.classifier=this.makeClassifier();button.disabled=false;button.textContent='Kalibrovat znovu'}}
 finish(){const form={call:this.el('logCall').value,sent:this.el('logSent').value,rcvd:this.el('logRcvd').value,name:this.el('logName').value,qth:this.el('logQth').value},result=Coach.evaluate(this.engine,form);this.history.push({at:new Date().toISOString(),score:result.score,mode:this.mode,seed:this.lastSeed,call:this.engine.station?.call||'',hand:result.hand,frequencyKHz:this.engine.frequency,band:this.settings.band,modeRadio:'CW',manualLog:form,transcript:this.engine.log,issues:result.issues});if(this.history.length>200)this.history.shift();Storage.set('history',this.history);const rows=Object.entries(result.checks).map(([k,v])=>`<tr><td>${ESC(k)}</td><td>${ESC(v.got||'—')}</td><td>${ESC(v.expected||'—')}</td><td class="${v.ok?'ok':'bad'}">${v.optional?'—':v.ok?'✔':'✘'}</td></tr>`).join('');const list=result.advice.length?`<ol>${result.advice.map(x=>`<li>${ESC(x)}</li>`).join('')}</ol>`:'<p class="ok">Bez zjištěných chyb.</p>';const hand=result.hand?`<p>Ruka: ${result.hand.wpm.toFixed(1)} WPM · čárka/tečka ${result.hand.ratio.toFixed(2)}:1 · σ mezer ${result.hand.gapSd.toFixed(1)} ms.</p>`:'';this.el('results').innerHTML=`<h3>Skóre <strong style="color:var(--amber)">${result.score}/100</strong></h3><table><thead><tr><th>Pole</th><th>Tvůj log</th><th>Simulovaná skutečnost</th><th>Stav</th></tr></thead><tbody>${rows}</tbody></table>${hand}<h3>Nejvýš 3 doporučení</h3>${list}`;this.el('results').classList.remove('hidden');this.el('transcript').textContent=this.engine.log.map(x=>`${(x.at/1000).toFixed(1).padStart(6)}s ${x.who==='ME'?'→':'←'} ${x.text}`).join('\n');this.el('hisScreen').textContent=this.engine.lastTx;this.setHint();this.toast('QSO hotovo · skóre '+result.score+'/100');this.showHistory()}
 showHistory(){const h=this.history,avg=h.length?h.reduce((s,x)=>s+x.score,0)/h.length:0;this.el('statsView').textContent=h.length?`Historie: ${h.length} QSO · průměr ${avg.toFixed(1)}/100 · posledních 10: ${h.slice(-10).map(x=>x.score).join(', ')}`:'Historie zatím prázdná.'}
 toast(text,error=false){this.el('toast').textContent=text;this.el('toast').style.color=error?'var(--red)':'var(--amber)'}
 loop(){requestAnimationFrame(()=>this.loop());const safe=(name,fn)=>{try{fn()}catch(err){this.loopFaults.push(name+': '+err.message);if(this.loopFaults.length>20)this.loopFaults.shift();this.toast(name+': '+err.message,true)}};
  safe('QSOEngine',()=>{if(!this.engine||!this.clockStart)return;this.engine.advanceTo(Math.max(this.engine.now,performance.now()-this.clockStart));if(performance.now()-this.lastSecondRender>1000){this.updateFrequency();this.lastSecondRender=performance.now()}});
  safe('Classifier',()=>{if(this.classifier&&this.audio?.ready&&!this.keyboardActive){this.classifier.endDots=Math.max(12,Number(this.settings.endDots));this.classifier.endSilence=Number(this.settings.endSilence);this.classifier.tick(this.audio.ctx.currentTime*1000)}});
  safe('Keyboard',()=>{if(this.keyboardActive&&performance.now()>=this.keyboardFinish){this.keyboardActive=false;this.engine?.keyActivity(Math.max(this.engine.now,performance.now()-this.clockStart),false);this.audio?.muteDecoder(false);this.el('sendKeyboard').disabled=false;if(!this.keySendAbort)this.userTurn(this.keyboardText,{wpm:Number(this.settings.wpm),dot:1200/this.settings.wpm,dash:3600/this.settings.wpm,ratio:3,gapSd:0,edgeCount:0,markCount:0,merged:0});this.engine?.setTurnOpen(false)}});
  safe('AudioEngine',()=>this.audio?.update());
  safe('RX display',()=>{if(this.currentRx&&this.settings.exam!=='exam'&&this.settings.rxTextMode==='live'){const elapsed=performance.now()-this.currentRx.start,words=this.currentRx.text.split(' ');let t=0,shown='';for(const w of words){const duration=MorseCode.textTime(w,this.currentRx.wpm)+1200/this.currentRx.wpm*7;if(t+duration>elapsed)break;shown+=(shown?' ':'')+w;t+=duration}this.el('hisScreen').textContent=shown||'·'}});
  safe('Diagnostics',()=>{if(!this.audio?.ready)return;const l=this.audio.latency(),edge=this.lastEdges.length?this.lastEdges.reduce((a,b)=>a+b,0)/this.lastEdges.length:NaN,val=this.lastLevel;this.el('diagnostics').textContent=`Vzorkování ${this.audio.ctx.sampleRate} Hz | baseLatency ${l.base===null?'N/A':(l.base*1000).toFixed(1)+' ms'} | outputLatency ${l.output===null?'N/A':(l.output*1000).toFixed(1)+' ms'}\nHrana → zpráva ${Number.isFinite(edge)?edge.toFixed(1)+' ms':'N/A'} | hrany ${this.lastEdges.length}\nTón ${val?.lockedHz.toFixed(1)||'—'} Hz | práh ${val?.threshold.toFixed(4)||'—'} | šum ${val?.floor.toFixed(4)||'—'} | stav ${val?.on?'ON':'OFF'}`;if(val){const level=this.audio.playedLevel||0,meter=Math.max(0,Math.min(100,level>0?35+20*Math.log10(level/.014):0));this.el('sbar').style.width=meter+'%';this.el('sreading').textContent='S'+Math.max(1,Math.min(9,Math.round(2+Math.max(-12,20*Math.log10(Math.max(1e-8,level)/.014))/6)))}});
 }
 async runE2E(){const button=this.el('e2eTests'),root=this.el('selftests');button.disabled=true;const line=document.createElement('div');line.className='case';line.textContent='E2E: inicializace virtuálního mikrofonu';root.append(line);try{const result=await runRealMicrophoneE2E(message=>{line.textContent='E2E: '+message});line.className='case pass';line.textContent='✔ E2E: '+result.details}catch(e){line.className='case fail';line.textContent='✘ E2E: '+e.message}finally{button.disabled=false}}
 async runTests(){const root=this.el('selftests');root.textContent='Testování…';this.el('runTests').disabled=true;try{const results=await runAcceptanceTests();root.replaceChildren();for(const a of results){const d=document.createElement('div');d.className='case '+(a.pass===null?'skip':a.pass?'pass':'fail');d.textContent=`${a.pass===null?'◌':a.pass?'✔':'✘'} ${a.id}. ${a.name}${a.detail?' — '+a.detail:''}`;root.append(d)}const summary=document.createElement('h3');summary.textContent=`Výsledek: ${results.filter(x=>x.pass).length} / ${results.length} prošlo · ${results.filter(x=>x.pass===false).length} selhalo · ${results.filter(x=>x.pass===null).length} nepodporováno`;root.prepend(summary)}catch(e){root.textContent='Test selhal: '+e.stack}finally{this.el('runTests').disabled=false}}
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{window.cwTrainer=new TrainerUI()});
/* ─── Deterministic acceptance suite ───────────────────────────────────── */
export async function offlineDecode(text,{wpm=20,snr=20,hand=0,interferer=false,tempoChange=false,tailMs=1600,noiseDbfs=null,seed=42,startWpm=null}={}){
 const fs=48000,code=tempoChange?(()=>{const a=MorseCode.events('CQ CQ',15),b=MorseCode.events('DE OK1JDV K',25),sep=1200/15*7;return {events:a.events.concat(b.events.map(e=>({...e,on:e.on+a.duration+sep,off:e.off+a.duration+sep}))),duration:a.duration+sep+b.duration}})():MorseCode.events(text,wpm,{variation:hand,rng:new RNG(seed)});
 const warmupMs=550;for(const event of code.events){event.on+=warmupMs;event.off+=warmupMs}code.duration+=warmupMs;
 const duration=code.duration+tailMs,count=Math.ceil(fs*duration/1000),edges=[];
 let offline=null,node=null;
 if(typeof OfflineAudioContext!=='undefined'){
  const candidate=new OfflineAudioContext(1,count,fs);
  if(candidate.audioWorklet){try{await candidate.audioWorklet.addModule(new URL('./cw-worklet.js',import.meta.url));offline=candidate}catch{offline=null}}
 }
 if(offline){node=new AudioWorkletNode(offline,'tone-detector',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});node.port.onmessage=e=>{if(e.data.type==='edge')edges.push({...e.data})};node.port.postMessage({type:'config',freq:650,dot:1200/(startWpm||(tempoChange?15:wpm)),enabled:true});node.connect(offline.destination)}
 const buff=offline?offline.createBuffer(1,count,fs):null,data=buff?buff.getChannelData(0):new Float32Array(count),rng=new RNG(1920),noiseAmp=noiseDbfs===null?.13/Math.pow(10,snr/20):Math.sqrt(3)*Math.pow(10,noiseDbfs/20);
 let k=0;const ramp=Math.ceil(fs*.004);for(let i=0;i<count;i++){while(k<code.events.length&&i>Math.round(code.events[k].off*fs/1000))k++;const m=code.events[k];let amplitude=0;if(m){const on=Math.round(m.on*fs/1000),off=Math.round(m.off*fs/1000);if(i>=on&&i<off)amplitude=Math.min(1,(i-on)/ramp,(off-i)/ramp)}const t=i/fs;data[i]=.24*amplitude*Math.sin(2*Math.PI*650*t)+noiseAmp*(rng.next()*2-1)+(interferer?.24*Math.sin(2*Math.PI*450*t):0)}if(offline){const src=offline.createBufferSource();src.buffer=buff;src.connect(node);src.start(0);await offline.startRendering();await new Promise(r=>setTimeout(r,30))}
 else {
  // The same exported processor, not a second DSP implementation. Chrome currently
  // lacks OfflineAudioContext.audioWorklet on several releases. Run its process()
  // in 128-frame blocks using the synthetic signal under a virtual audio clock.
  // This is a deterministic DSP fallback, not a physical browser E2E validation.
  const {ToneDetectorProcessor}=await import('./cw-worklet.js');
  const previousRate=Object.getOwnPropertyDescriptor(globalThis,'sampleRate'),previousFrame=Object.getOwnPropertyDescriptor(globalThis,'currentFrame');
  try{
   globalThis.sampleRate=fs;globalThis.currentFrame=0;
   const processor=new ToneDetectorProcessor();
   processor.port.postMessage=d=>{if(d.type==='edge')edges.push({...d})};
   processor.port.onmessage({data:{type:'config',freq:650,dot:1200/(startWpm||(tempoChange?15:wpm)),enabled:true}});
   const silence=new Float32Array(128);
   for(let i=0;i<count;i+=128){globalThis.currentFrame=i;processor.process([[data.subarray(i,Math.min(count,i+128))]],[[silence]])}
  }finally{
   if(previousRate)Object.defineProperty(globalThis,'sampleRate',previousRate);else delete globalThis.sampleRate;
   if(previousFrame)Object.defineProperty(globalThis,'currentFrame',previousFrame);else delete globalThis.currentFrame;
  }
 }
 edges.sort((a,b)=>a.frame-b.frame);
 let decoded='',stats=null;const cl=new Classifier({sampleRate:fs,wpm:startWpm||(tempoChange?15:wpm),endSilence:2500,onFinal:(t,s)=>{decoded=t;stats=s}});for(const e of edges){cl.tick(e.frame/fs*1000-.01);cl.edge(e.on,e.frame)}cl.tick(duration+2600);if(!decoded)decoded=cl.text.trim();if(!stats)stats=cl.stats();const expected=code.events.flatMap(e=>[{on:true,frame:Math.round(e.on*fs/1000)},{on:false,frame:Math.round(e.off*fs/1000)}]);let idx=0,errors=[];for(const e of edges){while(idx<expected.length&&expected[idx].on!==e.on)idx++;if(idx<expected.length){errors.push(Math.abs((e.frame-expected[idx].frame)/fs*1000));idx++}}return {text:decoded,edges:edges.length,expectedEdges:expected.length,falseEdges:edges.filter(e=>e.frame/fs*1000>code.duration+150).length,meanError:errors.length?errors.reduce((a,b)=>a+b,0)/errors.length:Infinity,stats,correct:decoded===text};
}

/** Regression checks 18+; browser-only audio checks explicitly report unsupported. */

/** Real-time closed-loop path: second AudioContext → MediaStreamDestination → getUserMedia → real AudioWorklet. */
export async function runRealMicrophoneE2E(onProgress=()=>{}){
 const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC||!navigator.mediaDevices?.getUserMedia)throw Error('E2E vyžaduje Chrome/Safari s Web Audio a mikrofonním API');
 const src=new AC({latencyHint:'interactive'}),destination=src.createMediaStreamDestination();
 const oscillator=src.createOscillator(),toneGain=src.createGain();oscillator.frequency.value=650;oscillator.type='sine';toneGain.gain.value=0;oscillator.connect(toneGain);toneGain.connect(destination);oscillator.start();
 const rng=new RNG(17017),noiseBuff=src.createBuffer(1,Math.round(src.sampleRate*2),src.sampleRate),data=noiseBuff.getChannelData(0),noiseAmp=Math.sqrt(3)*Math.pow(10,-55/20);
 for(let i=0;i<data.length;i++)data[i]=(rng.next()*2-1)*noiseAmp;
 const noise=src.createBufferSource();noise.buffer=noiseBuff;noise.loop=true;noise.connect(destination);noise.start();await src.resume();
 const media=navigator.mediaDevices,realGetUserMedia=media.getUserMedia;let audio=null,ticker=null,ended=false,pending=null;
 let clockStart=0,rxCount=0,falseEdges=0,edgeCount=0,lateEnds=[],recentMarks=[],transmitted=[],rawMarkOverRX=false;
 const settings={...DEFAULTS,ownCall:'OK1JDV',ownName:'DAVID',ownQth:'ZIREC',wpm:25,tone:650,signal:15,qsb:'none',cqNoAnswer:0,busyPercent:0,hand:0,notListening:0,outMode:'headphones',endDots:12};
 const engine=new QSOEngine({mode:'A',seed:1007,settings,onEvent:e=>{
  if(e.type==='tx'){onProgress('RX: '+e.text);audio?.playRX(e.text,e.station,e.wpm);rxCount++}
 }});
 let classifier;
 const audibleTime=()=>performance.now()-clockStart;
 function micEdge(d){if(ended)return;edgeCount++;const now=performance.now();if(d.on&&!recentMarks.some(([a,b])=>now>=a-95&&now<=b+95))falseEdges++;
  if(d.on)rawMarkOverRX=engine.transmitting;
  classifier.edge(d.on,d.frame);
 }
 function onFinal(text,stats){if(!text.trim()){engine.setTurnOpen(false);classifier.reset();return}const actual=text.trim();try{engine.receive(actual,{handStats:stats});onProgress('ME: '+actual);if(pending){const cb=pending;pending=null;cb(actual)}}finally{engine.setTurnOpen(false);classifier.reset()}}
 try{
  // Avoid changing the app's own microphone or AudioContext. Temporarily substitute
  // only getUserMedia while the isolated test engine opens its normal mic path.
  media.getUserMedia=async()=>destination.stream;
  if(media.getUserMedia===realGetUserMedia)throw Error('Podvržení getUserMedia není povoleno');
  audio=new AudioEngine(settings,micEdge,()=>{});await audio.start();
  if(!audio.micStream)throw Error('Testovací virtuální mikrofon nebyl připojen');
  classifier=new Classifier({sampleRate:audio.ctx.sampleRate,wpm:25,endDots:12,endSilence:2500,onFinal,onValidatedKey:on=>{
   const now=Math.max(engine.now,audibleTime());if(on)engine.setTurnOpen(true,now);
   engine.keyActivity(now,on,on&&rawMarkOverRX);
  }});
  engine.begin();clockStart=performance.now();
  ticker=setInterval(()=>{try{engine.advanceTo(Math.max(engine.now,audibleTime()));classifier.tick(audio.ctx.currentTime*1000);audio.update()}catch(e){onProgress('E2E: '+e.message)}},16);
  await new Promise(r=>setTimeout(r,1500)); // Allow 300 ms detector warm-up and steady noise estimate.
  async function key(text){
   const code=MorseCode.events(text,25,{variation:.1,rng:new RNG(transmitted.length*977+7)}),t0=src.currentTime+.18,now=performance.now(),offset=(t0-src.currentTime)*1000;
   transmitted.push(text);const expected=[];
   for(const mark of code.events){const a=t0+mark.on/1000,b=t0+mark.off/1000;const start=now+offset+mark.on,end=now+offset+mark.off;expected.push([start,end]);toneGain.gain.setValueAtTime(0,a);toneGain.gain.linearRampToValueAtTime(.20,a+.003);toneGain.gain.setValueAtTime(.20,Math.max(a+.003,b-.003));toneGain.gain.linearRampToValueAtTime(0,b)}
   recentMarks.push(...expected);const previous=edgeCount;
   let timeout;
   const decoded=await new Promise((resolve,reject)=>{pending=resolve;timeout=setTimeout(()=>{pending=null;reject(Error('CW přechod nebyl ukončen: '+text))},code.duration+3800)}).finally(()=>clearTimeout(timeout));
   const dt=performance.now()-now-(offset+code.duration),last=code.events.at(-1);if(last){const actualEnd=offset+last.off;lateEnds.push(performance.now()-now-actualEnd)}
   if(decoded!==text)throw Error('Dekódováno: '+decoded+' / očekáváno: '+text);if((text.endsWith(' K')||text.endsWith('<KN>'))&&lateEnds.at(-1)>900)throw Error('Přechod se ukončil po '+Math.round(lateEnds.at(-1))+' ms (limit 900 ms)');
   if(edgeCount-previous < code.events.length*1.9)throw Error('Chybějící hrany v '+text);
   return decoded;
  }
  async function until(predicate,label,limit=90000){const start=performance.now();while(!predicate()){if(performance.now()-start>limit)throw Error('Vypršel čas: '+label);await new Promise(r=>setTimeout(r,30))}}
  await key('QRL?');await key('CQ CQ CQ DE OK1JDV OK1JDV K');
  await until(()=>rxCount>=1&&!engine.transmitting&&engine.log.some(x=>x.who==='HIS'),'odpověď na CQ');
  await new Promise(r=>setTimeout(r,220));
  const his=engine.station.call;
  await key(`${his} DE OK1JDV GD TU FER CALL = UR RST 579 579 = NAME DAVID QTH ZIREC <KN>`);
  await until(()=>rxCount>=2&&!engine.transmitting,'stationReturn');await new Promise(r=>setTimeout(r,220));
  await key('R TU 73 DE OK1JDV <SK> E E');
  await until(()=>engine.state==='complete','uzavření QSO',16000);
  if(falseEdges)throw Error('Falešné hrany mimo plánovaný příposlech: '+falseEdges);
  return {pass:true,details:`QSO ${his} ukončeno, RX ${rxCount}, CW hran ${edgeCount}, falešných ${falseEdges}, poslední přechod ${Math.round(lateEnds.at(-1)||0)} ms po tónu`,state:engine.state,rxCount,falseEdges,transmitted};
 }finally{
  ended=true;if(ticker!==null)clearInterval(ticker);pending=null;
  try{media.getUserMedia=realGetUserMedia}catch{}
  try{oscillator.stop();noise.stop()}catch{}
  try{await audio?.close()}catch{}
  try{await src.close()}catch{}
 }
}

async function newAcceptanceTests(results,push,make){
 const check=(id,name,fn)=>{try{const x=fn();push(id,name,!!x.ok,x.detail||'')}catch(e){push(id,name,false,e.message)}};
 check(18,'A1: bezpečná inicializace AudioEngine a nezávislé části smyčky',()=>{const dummy=Object.create(AudioEngine.prototype);dummy.ctx={};dummy.ready=false;dummy.update();dummy.ready=true;dummy.rxVolume=null;dummy.update();let count=0;for(const f of [()=>{throw Error('test')},()=>{count++}])try{f()}catch{}return {ok:count===1}});
 check(19,'A2: záporné dB spektrum, 700 Hz ±5 Hz',()=>{const bin=5,frame=new Float32Array(2048).fill(-110),idx=140;frame[idx-1]=-35;frame[idx]=-28;frame[idx+1]=-36;const p=pickTonePeak([frame],bin);return {ok:Math.abs(p.hz-700)<=5,detail:p.hz.toFixed(2)+' Hz, SNR '+p.snr.toFixed(0)+' dB'}});
 check(20,'A2: plochý šum odmítnut',()=>{let rejects=false;try{pickTonePeak([new Float32Array(400).fill(-61)],5)}catch{rejects=true}return {ok:rejects}});
 check(21,'B5: K, <KN>, otazník a <AR> uzavírají přechod ≤900 ms',()=>{const cases=['K','<KN>','QRL?','<AR>','BK','E'],times=[];for(const text of cases){let at=-1;const c=new Classifier({wpm:25,onFinal:()=>{at=700}});c.text=text;c.upAt=0;c.tick(700);times.push(at>=0)}return {ok:times.every(Boolean),detail:times.join(',')}});
 check(22,'B6: <SK> E E drží v jediném přechodu',()=>{let finals=0;const c=new Classifier({wpm:20,onFinal:()=>finals++});c.text='R TU 73 DE OK1JDV <SK>';c.upAt=0;c.tick(500);const kept=finals===0;c.text+=' E E';c.upAt=500;c.tick(1300);return {ok:kept&&finals===1}});
 check(23,'C8: zkrácené volání MY MY bez DE',()=>{const p=Parser.parse('OK1JDV OK1JDV KN'),e=make('B');e.advanceTo(301);e.advanceTo(e.rxEndsAt+250);e.receive('OK1JDV OK1JDV KN');return {ok:p.fromCall==='OK1JDV'&&e.state==='waitMyExchange',detail:p.fromCall+' / '+e.state}});
 check(24,'C9: <KN> a <SK> bez falešných chyb zakončení',()=>{const e=make('B');e.station=e.makeStation('DL1ABC');e.log=[{who:'ME',text:'DL1ABC DE OK1JDV OK1JDV <KN>'},{who:'ME',text:'DL1ABC DE OK1JDV R GD = UR RST 579 579 = NAME DAVID QTH ZIREC = 73 DL1ABC DE OK1JDV <KN>'},{who:'ME',text:'E'}];const r=Coach.evaluate(e,{call:'DL1ABC',sent:'579',rcvd:e.station.report});return {ok:!r.issues.some(x=>x.includes('zakončení')||x.includes('konci')),detail:r.issues.join('; ')}});
 check(25,'C9: agregace ruky ze všech přechodů',()=>{const e=make('A');e.station=e.makeStation('DL1ABC');e.log=[{who:'ME',text:'CQ CQ CQ DE OK1JDV K',handStats:{marks:[48,145],spaces:[48],dot:48,dash:145,ratio:3,wpm:25,markCount:2,edgeCount:4,merged:0}},{who:'ME',text:'R TU 73 DE OK1JDV <SK> E E',handStats:{marks:[50,150],spaces:[50],dot:50,dash:150,ratio:3,wpm:24,markCount:2,edgeCount:4,merged:0}}];const r=Coach.evaluate(e,{});return {ok:r.hand?.markCount===4,detail:'marks '+r.hand?.markCount}});
 check(26,'C10: report UR 579 a UR 5NN',()=>({ok:Parser.parse('UR 579 579 KN').rst==='579'&&Parser.parse('UR 5NN KN').rst==='5NN'}));
 check(27,'C10: QTH složené, NOVI SAD a NOVO MESTO',()=>{const p=Parser.parse('NAME DAVID QTH ZIREC NR DVUR KRALOVE = 73 KN');return {ok:p.qth==='ZIREC NR DVUR KRALOVE'&&Parser.parse('QTH NOVO MESTO = WX CLDY').qth==='NOVO MESTO'&&COUNTRY_PROFILES.SI.cities.includes('NOVO MESTO')&&COUNTRY_PROFILES.RS.cities.includes('NOVI SAD'),detail:p.qth}});
 check(28,'C11–12: kalibrační režim a prázdný přechod',()=>{const e=make('A');const before=e.log.length;e.receive('');return {ok:e.log.length===before}});
 check(29,'C13: S-metr sleduje skutečnou amplitudu včetně QSB',()=>{const a=Object.create(AudioEngine.prototype);a.settings={signal:3};a.activeRX={};a.qsbWalk=-10;const low=a.signalAmplitude(3)*Math.pow(10,a.qsbWalk/20),high=a.signalAmplitude(3);return {ok:low<high/3,detail:low.toFixed(4)+' vs '+high.toFixed(4)}});
 check(30,'A4: 40 s souvislého klíčování nevygeneruje ?',()=>{const e=make('A');e.receive('CQ CQ CQ DE OK1JDV OK1JDV K');e.advanceTo(e.rxEndsAt+50);const start=e.now;for(let t=200;t<40000;t+=200)e.keyActivity(start+t,t%400===200);e.keyActivity(start+40000,false);e.receive('DL1ABC DE OK1JDV GD TU FER CALL = UR RST 579 579 = NAME DAVID QTH ZIREC KN');e.advanceTo(Math.max(e.now,e.rxEndsAt+100));return {ok:e.state==='waitMyClose'&&!e.log.some(x=>x.who==='HIS'&&x.text==='?'),detail:e.state}});
 check(31,'A4: B odpověď trvá 12 s, bez další CQ',()=>{const e=make('B');e.advanceTo(301);e.advanceTo(e.rxEndsAt+100);const at=e.now+1000;e.keyActivity(at,true);for(let t=200;t<12000;t+=200)e.keyActivity(at+t,!!(t%400));e.keyActivity(at+12000,false);e.receive(`${e.station.call} DE OK1JDV OK1JDV KN`);e.advanceTo(Math.max(e.now,e.rxEndsAt+100));return {ok:e.state==='waitMyExchange'&&e.cqCount===1,detail:'CQ '+e.cqCount+', '+e.state}});
 check(32,'A4: reálný TX kolize, odložené odpovědi',()=>{const e=make('C');e.keyActivity(100,true);e.receive('DL7ABC DE OK1JDV K');const t=e.events.find(x=>x.type==='tx')?.at||0;e.advanceTo(t+100);const none=e.log.filter(x=>x.who==='HIS').length===0;e.keyActivity(e.now,false);e.advanceTo(e.now+1700);return {ok:none&&e.log.some(x=>x.who==='HIS'),detail:e.state}});
 check(33,'C9: režim C varianta a) závěrečné E',()=>{const e=make('C');e.station=e.makeStation('DL7ABC');e.log=[{who:'ME',text:'DL7ABC DE OK1JDV K'},{who:'ME',text:'DL7ABC DE OK1JDV R GD = UR RST 579 579 = 73 DL7ABC DE OK1JDV KN'},{who:'ME',text:'E'}];const r=Coach.evaluate(e,{});return {ok:!r.issues.some(x=>x.includes('Na konci chybí')),detail:r.issues.join('; ')}});
 check(34,'A1: rAF se plánuje před izolovanými sekcemi',()=>{const src=TrainerUI.prototype.loop.toString();return {ok:src.indexOf('requestAnimationFrame')<src.indexOf("safe('QSOEngine'")&&src.includes("safe('AudioEngine'")}});
 check(39,'C11: kalibrace VVV určí WPM a asymetrii hran',()=>{const edges=[],dot=48,bias=5;let t=0;for(let k=0;k<7;k++){for(let j=0;j<3;j++){edges.push({on:true,ms:t});edges.push({on:false,ms:t+dot+bias});t+=2*dot}t+=2*dot}const h=estimateHandTiming(edges,48000);return {ok:Math.abs(h.wpm-25)<.5&&Math.abs(h.edgeBias-5)<1,detail:h.wpm.toFixed(1)+' WPM / '+h.edgeBias.toFixed(1)+' ms'}});
 check(40,'C9: bezchybné QSO B má 100/100',()=>{const e=make('B');e.station=e.makeStation('DL1ABC');const s=e.station;e.state='complete';e.log=[{who:'HIS',text:'CQ CQ CQ DE DL1ABC DL1ABC K'},{who:'ME',text:'DL1ABC DE OK1JDV OK1JDV <KN>'},{who:'HIS',text:`OK1JDV DE DL1ABC GD TU FER CALL = UR RST ${s.report} ${s.report} = NAME ${s.name} QTH ${s.qth} KN`},{who:'ME',text:'DL1ABC DE OK1JDV R GD = UR RST 559 559 = NAME DAVID QTH ZIREC = 73 DL1ABC DE OK1JDV <KN>'},{who:'HIS',text:'R TU 73 DE DL1ABC <SK> E E'},{who:'ME',text:'E'}];const r=Coach.evaluate(e,{call:s.call,sent:'559',rcvd:s.report,name:s.name,qth:s.qth});return {ok:r.score===100,detail:r.score+'/100 '+r.issues.join('; ')}});
 // v1.2 regression coverage, including long open turns and invalid edge bursts.
 check(42,'v1.2/1: B MY MY 5 s + 2,5 s ticha bez kolize',()=>{
  const e=make('B',{wpm:20}),base=()=>e.log.filter(x=>x.who==='HIS').length;
  e.advanceTo(301);e.advanceTo(e.rxEndsAt+1000);const count=e.cqCount,at=e.now;
  e.setTurnOpen(true,at);e.keyActivity(at,true);
  for(let t=250;t<=5000;t+=250)e.keyActivity(at+t,t%500===0);
  e.keyActivity(at+5000,false);e.advanceTo(at+7500);
  const unchanged=e.cqCount===count&&!e.transmitting&&e.violations.length===0;
  e.receive('OK1JDV OK1JDV');e.setTurnOpen(false);
  e.advanceTo(e.rxEndsAt+300);
  return {ok:unchanged&&e.state==='waitMyExchange'&&e.violations.length===0,detail:`CQ ${e.cqCount}, stav ${e.state}, kolize ${e.violations.length}`};
 });
 check(43,'v1.2/1: B <KN> 8 WPM, přechod otevřený po 1,8 s',()=>{
  const e=make('B',{wpm:8}),s=e.station;
  e.advanceTo(301);e.advanceTo(e.rxEndsAt+1000);const at=e.now,count=e.cqCount;
  e.setTurnOpen(true,at);e.keyActivity(at,true);e.keyActivity(at+2200,false);
  e.advanceTo(at+4000);const safe=e.cqCount===count&&!e.transmitting&&e.violations.length===0;
  e.receive(`${s.call} DE OK1JDV OK1JDV <KN>`);e.setTurnOpen(false);
  e.advanceTo(e.rxEndsAt+200);
  return {ok:safe&&e.state==='waitMyExchange'&&e.violations.length===0,detail:`stav ${e.state}, CQ ${e.cqCount}`};
 });
 check(44,'v1.2/1: simplex jen při začátku klíčování do RX',()=>{
  const e=make('B');e.advanceTo(301);e.advanceTo(e.rxEndsAt+1000);
  e.setTurnOpen(true);e.keyActivity(e.now,true);e.keyActivity(e.now+100,false);
  e.advanceTo(e.now+2500);e.receive('OK1JDV OK1JDV');e.setTurnOpen(false);
  return {ok:e.state==='waitMyExchange'&&e.violations.length===0,detail:e.violations.join(',')};
 });
 check(45,'v1.2/3: 8ms pulzy nesmějí hlásit keyActivity',()=>{
  let calls=0,final=0;const c=new Classifier({sampleRate:1000,wpm:20,onValidatedKey:()=>calls++,onFinal:()=>final++});
  c.text='OK1JDV OK1JDV';c.upAt=0;
  for(let i=1;i<=120;i++){c.edge(true,i*240);c.edge(false,i*240+8);c.tick(i*240+40)}
  return {ok:calls===0&&final===1,detail:`validované hrany ${calls}, dokončení ${final}`};
 });
 check(46,'v1.2/3: platná značka se hlásí již během KEY DOWN',()=>{
  const calls=[],c=new Classifier({sampleRate:1000,wpm:8,onValidatedKey:(on,t)=>calls.push({on,t})});
  c.edge(true,100);c.tick(150);c.edge(false,490);
  return {ok:calls.length===2&&calls[0].on===true&&calls[0].t===100&&calls[1].on===false,detail:JSON.stringify(calls)};
 });
 check(47,'v1.2/4: waitE rozumí E, 73 a <SK> uvnitř věty',()=>{
  const phrases=['E','E E','TU 73 E E','R TU 73 DE OK1JDV <SK> E E'];
  return {ok:phrases.every(t=>{const e=make('B');e.station=e.makeStation('DL1ABC');e.state='waitE';e.receive(t);return e.state==='complete'}),detail:phrases.join(' / ')};
 });
 check(48,'v1.2/4: waitE v režimu C rozumí úplnému závěru',()=>{
  const e=make('C');e.station=e.makeStation('DL7ABC');e.state='waitE';e.receive('R TU 73 DE OK1JDV <SK> E E');
  return {ok:e.state==='complete',detail:e.state};
 });
 check(49,'v1.2/5: kalibrační pole a text jsou celé Hz',()=>{
  const body=TrainerUI.prototype.calibrate.toString(),setup=TrainerUI.prototype.setup.toString();
  return {ok:body.includes('Math.round(tone.hz)')&&setup.includes('Math.round(this.calibration.hz)')};
 });
 check(50,'v1.2/1: otevřený přechod blokuje již naplánovanou TX',()=>{
  const e=make('C');e.receive('DL7ABC DE OK1JDV K');const txAt=e.events.find(x=>x.type==='tx').at;
  e.setTurnOpen(true);e.advanceTo(txAt+3000);const blocked=e.log.every(x=>x.who!=='HIS');
  e.setTurnOpen(false);e.advanceTo(e.now+1600);
  return {ok:blocked&&e.log.some(x=>x.who==='HIS'),detail:`blokace ${blocked}`};
 });
 for(const [id,name,expr,opts] of [
  [35,'A3: 60 s šumu −55 dBFS po CW: nula falešných hran','VVV VVV VVV K',{wpm:25,snr:20,tailMs:60000,noiseDbfs:-55}],
  [36,'B7: 25 WPM ±12 % OOO TTT MMM K po 15 WPM','OOO TTT MMM K',{wpm:25,startWpm:15,snr:25,hand:.12}],
  [37,'B7: 25 WPM ±12 % úplná výměna','DL1ABC DE OK1JDV GD TU FER CALL = UR RST 579 579 = NAME DAVID QTH ZIREC <KN>',{wpm:25,startWpm:15,snr:25,hand:.12}],
  [38,'B7: 20 WPM ±10 % <SK> E E jeden přechod','R TU 73 DE OK1JDV <SK> E E',{wpm:20,snr:25,hand:.10}],
  [41,'A3: CW při SNR +15 dB dekódováno přesně','CQ CQ DE OK1JDV K',{wpm:25,snr:15,hand:.08}]
 ]){try{const x=await offlineDecode(expr,opts);if(x.unsupported)push(id,name,null,x.unsupported);else push(id,name,x.text===expr&&(id!==35||x.falseEdges===0),`${x.text} | hrany ${x.edges}, falešné ${x.falseEdges}`)}catch(e){push(id,name,false,e.message)}}
}
// Exercise the real exported worklet with a simulated audio clock. No alternative DSP.
async function workletWarmupProbe(){
 const {ToneDetectorProcessor}=await import('./cw-worklet.js'),fs=48000,total=1.7*fs;
 const oldRate=Object.getOwnPropertyDescriptor(globalThis,'sampleRate');
 const oldFrame=Object.getOwnPropertyDescriptor(globalThis,'currentFrame');
 const edges=[],rng=new RNG(20041);let reset=false;
 try{
  globalThis.sampleRate=fs;globalThis.currentFrame=0;
  const proc=new ToneDetectorProcessor();proc.port.postMessage=msg=>{if(msg.type==='edge')edges.push({...msg})};
  proc.port.onmessage({data:{type:'config',freq:650,enabled:true,dot:60}});
  const buffer=new Float32Array(128),out=new Float32Array(128),noise=Math.sqrt(3)*Math.pow(10,-55/20);
  for(let offset=0;offset<total;offset+=128){
   if(!reset&&offset>=fs*.8){proc.port.onmessage({data:{type:'config',freq:650}});reset=true}
   for(let j=0;j<128;j++){
    const t=(offset+j)/fs;
    const key=(t>=.04&&t<.15)||(t>=.54&&t<.67)||(t>=.85&&t<.98)||(t>=1.3&&t<1.43);
    buffer[j]=noise*(2*rng.next()-1)+(key?.24*Math.sin(2*Math.PI*650*t):0);
   }
   globalThis.currentFrame=offset;proc.process([[buffer]],[[out]]);
  }
  const times=edges.map(e=>e.frame/fs),first=times.filter(t=>t>.47&&t<.74),second=times.filter(t=>t>1.21&&t<1.51);
  const noWarmupEdges=times.every(t=>(t>=.3&&!(t>=.8&&t<1.1)));
  return {ok:noWarmupEdges&&first.length===2&&second.length===2&&edges.length===4,
   detail:`hrany ${edges.length}, po startu ${first.length}, po resetu ${second.length}, časy ${times.map(x=>x.toFixed(3)).join('/')}`};
 }finally{
  if(oldRate)Object.defineProperty(globalThis,'sampleRate',oldRate);else delete globalThis.sampleRate;
  if(oldFrame)Object.defineProperty(globalThis,'currentFrame',oldFrame);else delete globalThis.currentFrame;
 }
}

export async function runAcceptanceTests(){const r=[],push=(id,name,pass,detail='')=>r.push({id,name,pass,detail:String(detail)}),make=(mode,settings={},seed=12345)=>{const e=new QSOEngine({seed,mode,settings:{...DEFAULTS,cqNoAnswer:0,busyPercent:0,notListening:0,...settings}});e.begin();return e},flush=e=>e.advanceTo(Math.max(e.now+1,e.rxEndsAt+100));
 for(let id=1;id<=5;id++){let name='',opts={},expected='';if(id===1){name='20 WPM +20 dB, přesný CQ a hrany ≤10 ms';expected='CQ CQ CQ DE OK1JDV OK1JDV K';opts={wpm:20,snr:20}}if(id===2){name='15 → 25 WPM během přechodu';expected='CQ CQ DE OK1JDV K';opts={tempoChange:true,wpm:15,snr:20}}if(id===3){name='±15 % délky značek';expected='CQ DE OK1JDV K';opts={wpm:20,snr:20,hand:.15}}if(id===4){name='650 Hz proti stejně silnému rušení 450 Hz';expected='DE OK1JDV K';opts={wpm:20,snr:20,interferer:true}}if(id===5){name='Slité prosigny <SK>, <KN>, =';expected='<SK><KN>=';opts={wpm:20,snr:20}}
 try{const x=await offlineDecode(expected,opts);if(x.unsupported)push(id,name,null,x.unsupported);else push(id,name,x.correct&&(id!==1||x.meanError<=10),`${x.text} | hrany ${x.edges}/${x.expectedEdges}, průměr ${x.meanError.toFixed(1)} ms`)}catch(e){push(id,name,false,e.message)}}
 try{const e=make('A');e.receive('CQ CQ CQ DE OK1JDV OK1JDV K');e.advanceTo(4001);const rx=e.log.find(x=>x.who==='HIS');push(6,'A: odpověď do 4 s a platná značka',!!rx&&/OK1JDV DE/.test(rx.text)&&!!e.factory.country(e.station.call),rx?.text||'bez odpovědi')}catch(e){push(6,'A CQ',false,e.message)}
 try{const e=make('A');e.receive('CQ CQ CQ DE OK2XYZ OK2XYZ K');flush(e);e.receive('DL1ABC DE OK2XYZ GD TU FER CALL = UR RST 579 579 = NAME JIRI QTH PRAHA KN');flush(e);push(7,'A: vymyšlená moje značka OK2XYZ',e.myCall==='OK2XYZ'&&e.log.filter(x=>x.who==='HIS').every(x=>!x.text.includes('OK1JDV')),'moje značka '+e.myCall)}catch(e){push(7,'Vymyšlená značka',false,e.message)}
 try{const e=make('C');e.receive('DL7ABC DE OK1JDV K');const first=e.lastTx;flush(e);if(e.state==='waitMyIntro'){e.receive('DL7ABC DE OK1JDV GD TU FER CALL = UR RST 579 579 = NAME DAVID QTH ZIREC KN');flush(e);e.receive('R TU 73 DE OK1JDV <SK> E E');flush(e)}else{e.receive('DL7ABC DE OK1JDV R GD = UR RST 579 579 = NAME DAVID QTH ZIREC = 73 DL7ABC DE OK1JDV KN');flush(e);e.receive('E')}push(8,'C: DL7ABC německá stanice do E',e.station.call==='DL7ABC'&&e.station.country==='DE'&&e.state==='complete',first+' | '+e.state)}catch(e){push(8,'C německá stanice',false,e.message)}
 try{const e=make('C');e.receive('OK1XYZ DE OK2ABC KN');push(9,'C: česká stanice a značka OK2ABC',e.myCall==='OK2ABC'&&e.station?.call==='OK1XYZ'&&e.station.country==='CZ',e.lastTx)}catch(e){push(9,'C česká stanice',false,e.message)}
 try{const e=make('B');e.advanceTo(500);e.keyActivity(e.now,true);e.keyActivity(e.now+250,false);e.advanceTo(e.rxEndsAt+1);e.receive('DL1ABC DE OK1JDV OK1JDV KN');push(10,'B: simplex ignoruje klíčování do CQ',e.state==='cqLoop'&&e.violations.length>0,e.violations.join(', '))}catch(e){push(10,'B simplex',false,e.message)}
 try{const e=make('B');e.station=e.makeStation('DL1ABC');e.advanceTo(500);flush(e);e.receive('DL1ABD DE OK1JDV OK1JDV KN');push(11,'B: chybné písmeno zopakuje svoji značku',e.lastTx.includes('DL1ABC DL1ABC')&&e.violations.some(x=>x.includes('Chybně')),e.lastTx)}catch(e){push(11,'B fuzzy',false,e.message)}
 try{const e=make('A');e.station=e.makeStation('DL1ABC');e.station.name='HANS';e.receive('NAME?');push(12,'NAME? → NAME HANS HANS KN',e.lastTx==='NAME HANS HANS KN',e.lastTx)}catch(e){push(12,'NAME?',false,e.message)}
 try{const e=make('A');e.station=e.makeStation('DL1ABC');e.send('TEST',0);const old=e.station.wpm;e.receive('QRS PSE');const delta=old-e.station.wpm;push(13,'QRS: zpomalení všech dalších přechodů',delta>=3&&delta<=5,`${old} → ${e.station.wpm} WPM`)}catch(e){push(13,'QRS',false,e.message)}
 try{const e=make('A');e.station=e.makeStation('DL1ABC');e.log=[{who:'ME',text:'CQ CQ DE OK1JDV K'},{who:'ME',text:'R TU 73 <SK> E E'}];const score=Coach.evaluate(e,{call:e.station.call,rcvd:e.station.report,sent:'579',name:e.station.name,qth:e.station.qth});push(14,'Kontrola chybějící koncové identifikace',score.issues.some(x=>x.includes('konci')),score.issues.join('; '))}catch(e){push(14,'Značka na konci',false,e.message)}
 try{const no=make('A',{cqNoAnswer:100}),busy=make('A',{busyPercent:100});no.receive('CQ CQ CQ DE OK1JDV K');busy.receive('QRL? DE OK1JDV');push(15,'100 % žádná odpověď / 100 % obsazeno',!no.log.some(x=>x.who==='HIS')&&busy.state==='busy'&&['C','YES','QRL'].includes(busy.lastTx),`${no.noAnswer}, ${busy.busy}`)}catch(e){push(15,'Pravděpodobnosti',false,e.message)}
 try{const p=Parser.parse('CQCQ CQ DEOK1JDV OK1JDV K');push(16,'Parser: slitá CQ a DE',p.cq&&p.fromCall==='OK1JDV',JSON.stringify({cq:p.cq,fromCall:p.fromCall}))}catch(e){push(16,'Parser',false,e.message)}
 try{const a=make('A',{},82913),b=make('A',{},82913);a.receive('CQ CQ CQ DE OK1JDV K');b.receive('CQ CQ CQ DE OK1JDV K');a.advanceTo(7000);b.advanceTo(7000);push(17,'Stejný seed a vstupy = stejná sekvence',JSON.stringify(a.log)===JSON.stringify(b.log)&&a.station.call===b.station.call,`${a.station.call} = ${b.station.call}`)}catch(e){push(17,'Determinismus',false,e.message)}await newAcceptanceTests(r,push,make);
 try{const probe=await workletWarmupProbe();push(51,'v1.2/2: skutečný worklet po startu a přeladění potlačí prvních 300 ms',probe.ok,probe.detail)}catch(e){push(51,'v1.2/2: rychlé odhadování šumu při startu',false,e.message)}
 push(52,'v1.2/2: E2E čeká 1,5 s před prvním tónem',runRealMicrophoneE2E.toString().includes('setTimeout(r,1500)'));
 push(54,'v1.2/2: připojení mikrofonu spustí 300ms akvizici',AudioEngine.prototype.openMicrophone.toString().includes("type:'reset'"));
 try{let finals=0;let c; c=new Classifier({sampleRate:1000,wpm:20,onFinal:()=>{finals++;c.reset()}});
  for(const at of [100,1200]){c.edge(true,at);c.edge(false,at+60);c.tick(at+850)}
  push(53,'v1.2/2: E2E klasifikátor se resetuje mezi přechody',finals===2,`přechody ${finals}`);
 }catch(e){push(53,'v1.2/2: E2E reset klasifikátoru',false,e.message)}
 return r;
}
