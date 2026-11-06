const $ = id => document.getElementById(id);
const store = {
  get(key, fallback){try{return JSON.parse(localStorage.getItem("cyber_"+key)) ?? fallback}catch{return fallback}},
  set(key,value){localStorage.setItem("cyber_"+key,JSON.stringify(value))}
};
let rules=store.get("rules",[
 {id:1,name:"Allow HTTPS",ip:"*",port:"443",action:"ALLOW",enabled:true},
 {id:2,name:"Block SSH External",ip:"*",port:"22",action:"BLOCK",enabled:true},
 {id:3,name:"Allow DNS",ip:"*",port:"53",action:"ALLOW",enabled:true},
 {id:4,name:"Block Suspicious Host",ip:"203.0.113.66",port:"*",action:"BLOCK",enabled:true}
]);
let blacklist=store.get("blacklist",[{ip:"198.51.100.23",reason:"Percobaan brute force",added:new Date().toLocaleString("id-ID")}]);
let allowlist=store.get("allowlist",[]);
let logs=store.get("logs",[
 {time:new Date(Date.now()-60000).toLocaleString("id-ID"),ip:"203.0.113.66",port:22,activity:"SSH Login Attempt",action:"BLOCK"},
 {time:new Date(Date.now()-120000).toLocaleString("id-ID"),ip:"192.168.1.12",port:443,activity:"HTTPS Request",action:"ALLOW"},
 {time:new Date(Date.now()-180000).toLocaleString("id-ID"),ip:"198.51.100.23",port:21,activity:"FTP Access",action:"BLOCK"}
]);
let traffic=store.get("traffic",[]);
let totals=store.get("totals",{packets:124580,allowed:118920,blocked:5660});
let firewallOn=store.get("firewall",true);
let chartAllowed=[22,30,26,38,32,44,37,48,42,55,49,61,54,67],chartBlocked=[8,10,7,12,9,15,11,14,10,18,13,20,15,17];
function persist(){store.set("rules",rules);store.set("blacklist",blacklist);store.set("allowlist",allowlist);store.set("logs",logs);store.set("traffic",traffic);store.set("totals",totals);store.set("firewall",firewallOn)}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2400)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function status(action){return `<span class="status ${action==="ALLOW"?"allow":"block"}">${action==="ALLOW"?"DIIZINKAN":"DIBLOKIR"}</span>`}
function saveLog(ip,port,activity,action){logs.unshift({time:new Date().toLocaleString("id-ID"),ip,port,activity,action});logs=logs.slice(0,250);traffic.unshift(logs[0]);traffic=traffic.slice(0,10);totals.packets++;totals[action==="ALLOW"?"allowed":"blocked"]++;chartAllowed.push(action==="ALLOW"?Math.floor(28+Math.random()*42):Math.floor(18+Math.random()*22));chartBlocked.push(action==="BLOCK"?Math.floor(12+Math.random()*34):Math.floor(4+Math.random()*12));chartAllowed=chartAllowed.slice(-14);chartBlocked=chartBlocked.slice(-14);$("lastPacket").textContent="Paket terakhir: "+new Date().toLocaleTimeString("id-ID");persist();render()}
function decide(ip,port){if(!firewallOn)return "ALLOW";if(blacklist.some(x=>x.ip===ip))return "BLOCK";if(allowlist.some(x=>x.ip===ip))return "ALLOW";const match=rules.find(r=>r.enabled&&(r.ip==="*"||r.ip===ip)&&(r.port==="*"||String(r.port)===String(port)));return match?match.action:"ALLOW"}

function generateLivePacket(){
 const normal=[
  {ip:"192.168.1.25",port:443,activity:"HTTPS Request"},
  {ip:"192.168.1.31",port:53,activity:"DNS Query"},
  {ip:"192.168.1.42",port:443,activity:"HTTPS Request"},
  {ip:"10.0.0.18",port:80,activity:"HTTP Request"},
  {ip:"192.168.1.12",port:53,activity:"DNS Query"}
 ];
 const suspicious=[
  {ip:"203.0.113.66",port:22,activity:"SSH Login Attempt"},
  {ip:"198.51.100.23",port:21,activity:"Brute Force"},
  {ip:"203.0.113.90",port:3389,activity:"Port Scan"},
  {ip:"192.0.2.77",port:443,activity:"Malware Payload"}
 ];
 const isAttack=Math.random()<0.22;
 const pool=isAttack?suspicious:normal;
 const packet=pool[Math.floor(Math.random()*pool.length)];
 let action=decide(packet.ip,packet.port);
 // Malware payload is always rejected in this educational simulation.
 if(packet.activity==="Malware Payload" && firewallOn) action="BLOCK";
 saveLog(packet.ip,packet.port,packet.activity,action);
 const status=$("monitorStatus");
 if(status) status.textContent=isAttack?"Aktivitas mencurigakan terdeteksi":"Monitoring aktif · traffic diterima";
}
function updateLiveControl(){
 const button=$("liveToggle");
 if(!button)return;
 button.classList.toggle("paused",!liveMonitoring);
 $("liveLabel").textContent=liveMonitoring?"LIVE MONITORING · AKTIF":"LIVE MONITORING · PAUSED";
 $("liveState").textContent=liveMonitoring?"PAUSE":"LANJUTKAN";
 $("liveDot").style.background=liveMonitoring?"var(--green)":"var(--yellow)";
 $("monitorDot").style.background=liveMonitoring?"var(--green)":"var(--yellow)";
 $("monitorStatus").textContent=liveMonitoring?"Monitoring aktif · menunggu traffic":"Monitoring dijeda";
}
function startLiveMonitoring(){
 if(liveTimer)clearInterval(liveTimer);
 liveTimer=setInterval(()=>{if(liveMonitoring)generateLivePacket()},3000);
 updateLiveControl();
}
function render(){
 $("packets").textContent=totals.packets.toLocaleString("en-US");$("allowed").textContent=totals.allowed.toLocaleString("en-US");$("blocked").textContent=totals.blocked.toLocaleString("en-US");$("passRate").textContent=(totals.allowed/Math.max(1,totals.allowed+totals.blocked)*100).toFixed(1)+"%";
 $("activeRules").textContent=rules.filter(r=>r.enabled).length;$("ruleBadge").textContent=rules.length;$("ruleCount").textContent=rules.length+" aturan";$("blacklistCount").textContent=blacklist.length+" IP diblokir";$("allowlistCount").textContent=allowlist.length+" IP diizinkan";
 $("firewallToggle").textContent=firewallOn?"⏻ Matikan Firewall":"⏻ Aktifkan Firewall";$("firewallToggle").classList.toggle("off",!firewallOn);
 $("rulesTable").innerHTML=rules.map(r=>`<tr><td>${esc(r.name)}</td><td class="mono">${esc(r.ip)}</td><td>${esc(r.port)}</td><td>${status(r.action)}</td><td><span class="status ${r.enabled?"allow":"block"}">${r.enabled?"AKTIF":"NONAKTIF"}</span></td><td><button class="link-btn" data-toggle="${r.id}">${r.enabled?"Nonaktifkan":"Aktifkan"}</button> <button class="link-btn" data-delete-rule="${r.id}">Hapus</button></td></tr>`).join("")||'<tr><td colspan="6">Belum ada aturan firewall.</td></tr>';
 $("blacklistTable").innerHTML=blacklist.map(x=>`<tr><td>${esc(x.ip)}</td><td>${esc(x.reason||"-")}</td><td>${esc(x.added)}</td><td><button class="unblock-btn" data-unblock="${esc(x.ip)}">↗ Buka Blokir</button></td></tr>`).join("")||'<tr><td colspan="4">Blacklist kosong.</td></tr>';
 $("allowlistTable").innerHTML=allowlist.map(x=>`<tr><td>${esc(x.ip)}</td><td><span class="status allow">DIIZINKAN</span></td><td><button class="link-btn" data-revoke="${esc(x.ip)}">Cabut izin</button></td></tr>`).join("")||'<tr><td colspan="3">Belum ada IP dengan pengecualian izin.</td></tr>';
 $("logsTable").innerHTML=logs.map(x=>`<tr><td>${esc(x.time)}</td><td>${esc(x.ip)}</td><td>${x.port}</td><td>${esc(x.activity)}</td><td>${status(x.action)} ${x.action==="BLOCK"?`<button class="unblock-btn compact" data-allow-ip="${esc(x.ip)}">Izinkan IP</button>`:""}</td></tr>`).join("")||'<tr><td colspan="5">Belum ada log keamanan.</td></tr>';
 $("recentLogs").innerHTML=logs.slice(0,4).map(x=>`<tr><td>${esc(x.time)}</td><td>${esc(x.ip)}</td><td>${x.port}</td><td>${esc(x.activity)}</td><td>${status(x.action)}</td></tr>`).join("");
 $("trafficTable").innerHTML=traffic.map(x=>`<tr><td>${esc(x.time)}</td><td>${esc(x.ip)}</td><td>${x.port}</td><td>${esc(x.activity)}</td><td>${status(x.action)}</td></tr>`).join("")||'<tr><td colspan="5">Belum ada traffic. Jalankan simulasi untuk memulai.</td></tr>';
 drawChart();drawPorts();
}
function drawChart(){const c=$("trafficChart"),ctx=c.getContext("2d"),w=c.clientWidth,h=c.clientHeight,dpr=devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);ctx.font="9px DM Mono";ctx.fillStyle="#78879c";ctx.strokeStyle="#223044";ctx.lineWidth=1;for(let i=0;i<5;i++){let y=12+i*(h-30)/4;ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(w-5,y);ctx.stroke();ctx.fillText(String(80-i*20),2,y+3)}const max=80,plotW=w-40,plotH=h-28;function line(data,color){ctx.beginPath();data.forEach((v,i)=>{let x=32+i*plotW/(data.length-1),y=8+plotH-(v/max)*plotH;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke()}line(chartAllowed,"#20c997");line(chartBlocked,"#f05272")}
function drawPorts(){const data=[["22",78],["3389",55],["21",42],["23",31],["8080",19]];$("portBars").innerHTML=data.map(([p,v])=>`<div class="port-row"><span>${p}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join("")}
function showPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name))}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
$("firewallToggle").addEventListener("click",()=>{firewallOn=!firewallOn;persist();render();toast(firewallOn?"Firewall berhasil diaktifkan":"Firewall dinonaktifkan")});
$("liveToggle").addEventListener("click",()=>{liveMonitoring=!liveMonitoring;updateLiveControl();toast(liveMonitoring?"Live monitoring dilanjutkan":"Live monitoring dijeda")});
$("openRule").onclick=()=>$("ruleModal").classList.remove("hidden");$("closeRule").onclick=()=>$("ruleModal").classList.add("hidden");
$("ruleModal").addEventListener("click",e=>{if(e.target.id==="ruleModal")$("ruleModal").classList.add("hidden")});
$("ruleForm").addEventListener("submit",e=>{e.preventDefault();rules.push({id:Date.now(),name:$("ruleName").value.trim(),ip:$("ruleIp").value.trim(),port:$("rulePort").value.trim(),action:$("ruleAction").value,enabled:true});persist();render();e.target.reset();$("ruleModal").classList.add("hidden");toast("Aturan firewall berhasil ditambahkan")});
document.addEventListener("click",e=>{let t=e.target;if(t.dataset.toggle){rules=rules.map(r=>r.id==t.dataset.toggle?{...r,enabled:!r.enabled}:r);persist();render();toast("Status aturan diperbarui")}if(t.dataset.deleteRule){rules=rules.filter(r=>r.id!=t.dataset.deleteRule);persist();render();toast("Aturan dihapus")}if(t.dataset.unblock){const ip=t.dataset.unblock;blacklist=blacklist.filter(x=>x.ip!==ip);if(!allowlist.some(x=>x.ip===ip))allowlist.push({ip});persist();render();toast("Blokir dibuka; IP "+ip+" sekarang diizinkan")}if(t.dataset.allowIp){const ip=t.dataset.allowIp;blacklist=blacklist.filter(x=>x.ip!==ip);if(!allowlist.some(x=>x.ip===ip))allowlist.push({ip});persist();render();toast("IP "+ip+" sekarang diizinkan")}if(t.dataset.revoke){allowlist=allowlist.filter(x=>x.ip!==t.dataset.revoke);persist();render();toast("Pengecualian izin dicabut")}});
$("trafficForm").addEventListener("submit",e=>{e.preventDefault();const ip=$("sourceIp").value.trim(),port=Number($("targetPort").value),activity=$("activity").value,action=decide(ip,port);saveLog(ip,port,activity,action);const box=$("trafficResult");box.className="result-box "+(action==="ALLOW"?"good":"bad");box.innerHTML=`<span class="result-symbol">${action==="ALLOW"?"✓":"⛨"}</span><div><b>Koneksi ${action==="ALLOW"?"DIIZINKAN":"DIBLOKIR"}</b><p>IP ${esc(ip)} → port ${port} · ${esc(activity)}. ${action==="ALLOW"?"Paket lolos pemeriksaan firewall.":"Sistem menolak paket dan mencatat kejadian."}</p></div>`;toast("Pemeriksaan selesai: "+action)});
document.querySelectorAll("[data-attack]").forEach(b=>b.addEventListener("click",()=>{const attack=b.dataset.attack,ip=attack==="Port Scan"?"203.0.113.66":attack==="Brute Force"?"198.51.100.23":"192.0.2.77",port=attack==="Port Scan"?22:attack==="Brute Force"?22:443;let action=decide(ip,port);if(attack==="Malware Payload")action="BLOCK";saveLog(ip,port,attack,action);const box=$("trafficResult");box.className="result-box "+(action==="ALLOW"?"good":"bad");box.innerHTML=`<span class="result-symbol">${action==="ALLOW"?"✓":"⛨"}</span><div><b>Simulasi ${esc(attack)}: ${action==="ALLOW"?"DIIZINKAN":"DIBLOKIR"}</b><p>IP sumber ${ip}, port ${port}. Hasil simulasi tercatat pada log keamanan.</p></div>`;toast("Skenario "+attack+" selesai")}));
$("blacklistForm").addEventListener("submit",e=>{e.preventDefault();const ip=$("blacklistIp").value.trim();if(blacklist.some(x=>x.ip===ip)){toast("IP sudah ada di blacklist");return}blacklist.push({ip,reason:$("blacklistReason").value.trim()||"Ditambahkan manual",added:new Date().toLocaleString("id-ID")});persist();render();e.target.reset();toast("IP berhasil masuk blacklist")});
$("clearLogs").onclick=()=>{if(confirm("Hapus seluruh log keamanan?")){logs=[];traffic=[];persist();render();toast("Log keamanan dihapus")}};
$("exportLogs").onclick=()=>{const rows=[["Waktu","IP Asal","Port Target","Jenis Aktivitas","Tindakan"],...logs.map(x=>[x.time,x.ip,x.port,x.activity,x.action])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv"}));a.download="cybershield-security-logs.csv";a.click();URL.revokeObjectURL(a.href)};
function tick(){ $("clock").textContent=new Date().toLocaleTimeString("en-GB",{timeZone:"UTC"})+" UTC";$("cpu").textContent=(15+Math.floor(Math.random()*15))+"%";$("memory").textContent=(38+Math.floor(Math.random()*12))+"%";$("bandwidth").textContent=(1+Math.random()*2).toFixed(1)+" MB/s"}
window.addEventListener("resize",drawChart);setInterval(tick,1000);tick();render();startLiveMonitoring();