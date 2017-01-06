#!/usr/bin/env node
/**
 * DSA-Tools CLI: github.com/JakobMe/dsa-tools
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */
var Program=require("commander"),Colors=require("colors"),Util=function(){function n(n,e){return Math.floor(Math.random()*(e-n+1))+n}function e(n){var e=parseInt(n);return isNaN(e)?0:e}function r(n,e){return n.localeCompare(e)}return{randomInt:n,sortAlpha:r,toInt:e}}(),Str=function(){function n(n,e){for(var r=n.toString(),t=n.toString(),o=("undefined"==typeof e?"":e).toString(),i=0;i<o.length-t.length;i++)r=" "+r;return r}function e(n,e,r){return e+n.toString()+r}function r(n,e,r,t){var o=n.toString();return e===r?o.green:e===t?o.red:o}function t(n,e,t){var o=[];return n.forEach(function(n){o.push(r(n,n,e,t))}),o.join("/")}function o(n,e){return n.toString()+"w"+e.toString()+" "}function i(n){return e(n.join("/"),"(",") ")}function a(n){return e(n,"[","] ")}function u(n){var e=n.toString()+" ";return n<0?e.red:n>0?("+"+e).green:("±"+e).grey.dim}function c(n){var e="×"+n.toString();return n>1?e.grey.dim:e.grey.dim}function s(e,r,t,o){var i=n(e,o),a=n("Σ",t),u=r?": ":" ";return(a+u).grey.dim+i.cyan}function l(e,r,t,o,i){var a=r||t?" ‼":"";a=r?a.green:t?a.red:a.grey.dim;var u="\tQS "+n(e,i);return u=e<o?u.grey.dim:u,u+a+"\t"}function f(e,r){var t="\t"+n(e,r*-1);return e<0?t.red:t.green}function g(n){return e(n,'"','"')}function h(n){return n.toString()+"%"}function d(n,e){var r=n/e,t=h(Math.round(100*r)),o=Math.round(15*r),i="=".repeat(o),a=" ".repeat(15-o);return Str.brackets(" "+i.cyan+a+" ")+t.magenta}function m(n,e,r){var t=[];return n.split("\n").forEach(function(n){var o=[""],i=0;n.split(" ").forEach(function(n){p(n,o[i],e,r)||(o[++i]=""),o[i]+=n+" "}),o.forEach(function(n,e){o[e]=n.trim()}),t.push(o.join("\n"))}),t.join("\n")}function p(n,e,r,t){return n.replace(r,"").length+e.replace(r,"").length<=t}return{squeeze:p,linebreaks:m,percent:h,progressbar:d,indent:n,enclose:e,roll:r,rolls:t,dice:o,attr:i,brackets:a,mod:u,times:c,sum:s,quality:l,points:f,quote:g}}(),Log=function(){function n(n){s((n||"")+"\n")}function e(n){for(var e=0;e<(n||1);e++)s.previousLine(1),s.eraseLine()}function r(e){e="number"!=typeof e?1:e;for(var r=0;r<e;r++)n("")}function t(e,t,o){r(t),n(e),r(o)}function o(e){e.forEach(function(r,t){n((Str.indent(t+1,e.length)+". ").grey.dim+r)})}function i(n,e,r,o,i,a){var u=Str.indent("‼",e||0);r=r||!1,o=o||!1,u=r?u.red:o?u.green:u.grey.dim,t(u+"  "+n,i,a)}function a(n,e,r,t){i(n.red,e,!0,!1,r,t)}function u(n,e,r,t){i(n.toString().grey.dim,e,!1,!1,r,t)}function c(n,e,r,t){i(n.green,e,!1,!0,r,t)}var s=require("terminal-kit").terminal;return{spaced:t,success:c,empty:r,shout:i,error:a,hint:u,line:n,list:o,back:e}}(),Data=function(){function n(){u=require("path"),a=require("jsonfile"),c=u.join(__dirname+o),s=u.join(__dirname+i)}function e(e){n(),a.readFile(c,function(n,r){e(null!==n?{}:r)})}function r(e){n(),a.writeFile(c,e)}function t(e){n(),a.readFile(s,function(n,r){e(null!==n?{}:r)})}var o="/data.json",i="/config.json",a=null,u=null,c=null,s=null;return{config:t,load:e,save:r}}(),Update=function(){function n(n,i){Data.config(function(a){e(a,function(){v=require("dns"),L=require("crawler"),b=require("entities"),_quick=i.schnell||!1,k=i.erzwingen||!1,S=r(n||""),S&&t(function(n){n&&Data.load(o)})})})}function e(n,e){n.hasOwnProperty("btn")&&n.hasOwnProperty("text")&&n.hasOwnProperty("topics")&&n.hasOwnProperty("domain")&&n.hasOwnProperty("protocol")?(y=n,e()):Log.error(l)}function r(n){var e=[],r=[],t=[];return y.topics.forEach(function(o){e.push(o.name),t.push(o),o.name===n.toLowerCase()&&r.push(o)}),n.length?r.length?r:(Log.error(h,e.length,1,0),Log.hint(d,e.length,0,1),Log.list(e),Log.empty(),!1):t}function t(n){var e=y.domain.replace("/","");v.lookup(e,function(r){r?(Log.error(f,0,1,0),Log.hint(e,0,0,1),n(!1)):n(!0)})}function o(n){var e={rateLimit:0,maxConnections:_quick?10:1},r=[],t=[],o=new L(e),l=new L(e),f=y.protocol+y.domain;S.forEach(function(e){var o=e.name;n.hasOwnProperty(o)&&!k||(n[o]={}),e.urls.forEach(function(e){$++,t.push({uri:f+e,callback:function(e,t,i){if(w++,e)return i(),!1;var l=t.$(y.btn).filter(function(){return!n[o].hasOwnProperty(c(t.$(this).text().trim()))});q+=l.length,a(),l.each(function(){var e=t.$(this),i=c(e.text().trim()),a=encodeURI(e.attr(p));r.push({uri:f+a,callback:function(e,r,t){return x++,e?(t(),!1):(n[o][i]=s(r.$,r.$(y.text)),u(o,i),Data.save(n),void t())}})}),i()}})})}),i([l,o],[t,r])}function i(n,e){var r=n.length;r===e.length&&n.forEach(function(t,o){0===o&&t.queue(e[o]),t.on("drain",function(){o+1<r&&n[o+1].queue(e[o+1])})})}function a(){var n=q+" "+g,e=Str.progressbar(w,$);Log.empty(1===w?2:0),Log.back(1===w?0:3),Log.success(n,0,0,0),Log.shout(e,0,!1,!1,0,1)}function u(n,e){var r=x+"/"+q+" ",t=n+" "+Str.quote(e),o=Str.progressbar(x,q);Log.empty(1===x?1:0),Log.back(1===x?0:3),Log.success(r+t,0,0,0),Log.shout(o,0,!1,!1,0,1)}function c(n){return n.replace(/I-.*(I|V|X)|\(\*\)|\.\.\.|\*/g,"").trim()}function s(n,e){return e.length?(e.contents().filter(function(){var e=3===this.nodeType,r=0===n(this).text().trim().length;return r||e}).remove().find(m).each(function(){var e=n(this);e.replaceWith(e.html().trim())}),b.decodeXML(e.html().trim())):""}var l="Konfigurationsfehler!",f="Verbindungsfehler!",g="neue Begriffe gefunden",h="Thema existiert nicht, folgende sind verfügbar:",d="dsa aktualisiere [thema] [-e] [-s]",m="*:not(h1):not(strong):not(em):not(br):not(p)",p="href",v=null,L=null,b=null,S=!1,k=!1,y=!1,w=0,$=0,x=0,q=0;return{start:n}}(),Dice=function(){function n(n,e,r){e=Math.max(Util.toInt(e),1);var t=Util.toInt(r.mod),i=e>1||t,a=[],u=0;o(e,n).forEach(function(e,r){u+=e;var t=Str.indent(e,n);a.push(Str.roll(t,e,k,n))}),Log.spaced(Str.dice(e,n)+Str.mod(t)),Log.list(a),Log.spaced(i?Str.sum(u+t,!0):"",i?1:0)}function e(n,e,o){var s=t(n),g=Math.max(Util.toInt(e),0),h=Util.toInt(o.mod),d=o.wahrscheinlich||!1,m=d?0:Math.max(Util.toInt(o.sammel),1),p=Str.percent(u(s,g,h)),L=m>1,y=!1,w=!1,x=!1,E=[],M=0,P=0;if(s.length!==v)Log.error(f,0,1,0),Log.hint(l,0,0,1);else{for(var I=0;I<m;I++){var U=i(s,g,h,M),z=U.results,O=U.points,j=c(z,S),D=c(z,k),C=a(O,D,j,L),F=C<q;if(w=!!w||j,x=!!x||D,y=!!y||F,P=j?C:P+C,M=D?0:F?M+1:M,E.push(Str.rolls(z,k,b)+Str.points(O,v*b)+Str.quality(C,D,j,q,$)+Str.sum(P,!1,0,$*m)),j)break}if(Log.spaced(Str.dice(Str.indent(v,E.length),b)+Str.attr(s).magenta+Str.mod(h)+Str.brackets(g).magenta+Str.times(m)+" "+(d?p.cyan:p.grey.dim)),d)return;Log.list(E),r(E.length,x,y,w)}}function r(n,e,r,t){var o=!1,i=!1,a=n>1,u=!a&&r,c=!a&&!r;a||r||(i=p.green),!a&&r&&(i=m.red),a&&r&&(i=h.grey.dim),e&&(o=d.green),t&&(o=g.red),!i&&o&&Log.empty(),i&&Log.shout(i,n,u,c,1,0),o&&Log.shout(o,n,t,e,0,1),o||Log.empty()}function t(n){var e=[];return n.split("/").forEach(function(n){e.push(Math.max(Util.toInt(n),0))}),e}function o(n,e){for(var r=[],t=0;t<n;t++)r.push(Util.randomInt(1,e));return r}function i(n,e,r,t){var i=o(n.length,b),a=s(i,n,e,r,t);return{results:i,points:a}}function a(n,e,r,t){var o=Math.ceil(n/w),i=e?q:x,a=e&&t?y:r?0:1,u=0===n?q:o;return Math.max(Math.min(u*a,$),i)}function u(n,e,r){for(var t=0,o=1;o<=b;o++)for(var i=1;i<=b;i++)for(var a=1;a<=b;a++)if(c([o,i,a],k))t++;else if(!c([o,i,a],k)){var u=s([o,i,a],n,e,r,0);t+=u>=0?1:0}return Math.round(1/parseFloat(Math.pow(b,v))*t*100*100)/100}function c(n,e){var r=0;return n.forEach(function(n){r+=n===e?1:0}),r>=L}function s(n,e,r,t,o){var i=r+0;return n.forEach(function(n,r){i-=Math.max(0,n-(e[r]+t-o))}),i}var l="z.B. 11/13/12",f="Probe im falschen Format!",g="Patzer (automatisch misslungen)",h="Nach misslungenen Proben Malus kumulativ +1",d="Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)",m="Erfolgsprobe misslungen",p="Erfolgsprobe bestanden",v=3,L=2,b=20,S=20,k=1,y=2,w=3,$=6,x=0,q=1;return{roll:n,skill:e}}(),Search=function(){function n(n,r,o){v=require("didyoumean"),v.nullResultValue=!1,r=(r||"").toLowerCase(),n=(n||"").toLowerCase();var i=o.raten||!1,a=o.ungenau||!1;Data.load(function(o){var u=Object.keys(o).sort(Util.sortAlpha),c=t(n,u),s=0===n.length,l=u.length,p=s?g.green:f.red;l&&c?e(o[c],r,c,a,i):l?(Log.shout(p,l,!s,s),Log.list(u),Log.hint(h,l)):(Log.error(d,l,1,0),Log.hint(m,l,0,1))})}function e(n,e,t,f,g){var h=0===e.length,d=Object.keys(n),m=!1,v=[],L=h?s:c,b=l.replace("$1",t),S=p.replace("$1",t);d.forEach(function(n){e===n.toLowerCase()?m=n:r(e,n,f)&&v.push(n)}),v.sort(Util.sortAlpha);var k=m?m:o(e,v,g),y=v.length;k?Log.spaced(i(n[k])):y?(Log.success(L,y),Log.list(v),Log.hint(b,y)):h&&!y?(Log.error(u,y,1,0),Log.hint(S,y,0,1)):(Log.error(a,y,1,0),Log.hint(b,y,0,1))}function r(n,e,r){var t=r?require("fuzzysearch"):function(){return!1};return n=n.toLowerCase(),e=e.toLowerCase(),n.indexOf(e)!==-1||t(n,e)||e.indexOf(n)!==-1||t(e,n)}function t(n,e){return e.indexOf(n)>=0?n:v(n,e)}function o(n,e,r){return v.threshold=null,v.thresholdAbsolute=100,!!r&&v(n,e)}function i(n){var e=Str.linebreaks(n.replace(/<br\s*[\/]?>|<\/?p[^>]*>/gi,"\n"),/<[^>]*>/gi,80);return e.replace(/<h1>([\s\S]*?)<\/h1>/gi,"$1\n".green).replace(/<strong>([\s\S]*?)<\/strong>/gi,"$1".magenta).replace(/<em>([\s\S]*?)<\/em>/gi,"$1".cyan).trim()}var a="Kein passender Begriff gefunden.",u="Keine Begriffe verfügbar.",c="Folgende Begriffe wurden gefunden:",s="Folgende Begriffe sind verfügbar",l="dsa suche $1 [begriff] [-u] [-r]",f="Thema existiert nicht, folgende sind verfügbar:",g="Folgende Themen sind verfügbar:",h="dsa suche [thema] [begriff] [-u] [-r]",d="Keine Daten gefunden!",m="dsa aktualisiere [thema] [-e] [-s]",p="dsa aktualisiere $1 [-e] [-s]",v=null;return{find:n}}();!function(){function n(n,e){switch(e||(Log.line("  Examples:"),Log.empty()),n){case"dice":Log.line("    $ dsa w20 3 -m -2"),Log.line("    $ dsa w6 2 --mod 6");break;case"skill":Log.line("    $ dsa probe 13/16/14 6 -m -1"),Log.line("    $ dsa probe 14/13/15 9 -s 7 --mod 1"),Log.line("    $ dsa probe 12/13/11 4 --wahrscheinlich");break;case"update":Log.line("    $ dsa aktualisiere vorteil"),Log.line("    $ dsa aktualisiere kampf -s"),Log.line("    $ dsa aktualisiere --erzwingen");break;case"search":Log.line("    $ dsa suche"),Log.line("    $ dsa suche kultur"),Log.line("    $ dsa suche zauber ignifaxius"),Log.line("    $ dsa suche kampf wucht --raten"),Log.line('    $ dsa suche vorteil "verbessert leben" -ru'),Log.line('    $ dsa suche nachteil "schlechte energie" -u')}Log.empty()}[3,4,6,8,10,12,20,100].forEach(function(e){Program.command("w"+e+" [n]").description("N w"+e+" würfeln").option("-m, --mod <x>","Summenmodifikator").action(function(n,r){Dice.roll(e,n,r)}).on("--help",function(){n("dice")})}),Program.command("probe <probe> <fw>").description("Fertigkeitsprobe würfeln").option("-m, --mod <x>","Modifikator der Probe").option("-s, --sammel <n>","Sammelprobe mit N Versuchen").option("-w, --wahrscheinlich","Nur die Wahrscheinlichkeit anzeigen").action(function(n,e,r){Dice.skill(n,e,r)}).on("--help",function(){n("skill")}),Program.command("suche [thema] [begriff]").description("In einem Thema nach Begriff suchen").option("-u, --ungenau","Ungenaue Suche durchführen").option("-r, --raten","Suchergebnis raten").action(function(n,e,r){Search.find(n,e,r)}).on("--help",function(){n("search")}),Program.command("aktualisiere [thema]").description("Daten aktualisieren").option("-e, --erzwingen","Aktualisierung erzwingen").option("-s, --schnell","Mehr Verbindungen erlauben").action(function(n,e){Update.start(n,e)}).on("--help",function(){n("update")}),Program.version("0.0.1").description("Kommandozeilen-Tools für 'Das Schwarze Auge'").on("--help",function(){n("dice"),n("skill",!0),n("update",!0),n("search",!0)}).parse(process.argv),Program.args.length||Program.help()}();