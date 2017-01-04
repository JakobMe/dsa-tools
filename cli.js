#!/usr/bin/env node
/**
 * DSA-Tools CLI: github.com/JakobMe/dsa-tools
 * @author Jakob Metzger <jakob.me@gmail.com>
 * @copyright 2017 Jakob Metzger
 * @license MIT
 */
var Program=require("commander"),Colors=require("colors"),G=function(){return{STR:{TITLE:"++",BOLD:"==",PARA:"__",ITALIC:"--",NL:"\n",TAB:"\t",SPACE:" ",BULLET:". ",ALERT:"‼",QUOTE_LEFT:"„",QUOTE_RIGHT:"“",BRACK_LEFT:"[",BRACK_RIGHT:"]",PAREN_LEFT:"(",PAREN_RIGHT:")",HYPHEN:" — ",QUAL:"QS",SUM:"Σ",COLON:":",TIMES:"×",PLUS:"+",MINUS:"-",PLUSMINUS:"±",DELIMITER:"/",DICE:"d",TIC:"."},REGEX:{PH:"$1",TITLE:/\+\+(.*?)\+\+/g,BOLD:/==(.*?)==/g,ITALIC:/--(.*?)--/g,PARA:/__/g,HASH:/#(?!#)/g,LVL:/ I-.*(I|V|X)/,STAR:/ \(\*\)/,DOTS:/ \.\.\./}}}(),Util=function(){function n(n,e){return Math.floor(Math.random()*(e-n+1))+n}function e(n){var e=parseInt(n);return isNaN(e)?0:e}function t(n,e){return n.localeCompare(e)}return{randomInt:n,sortAlpha:t,toInt:e}}(),Str=function(){function n(n,e){for(var t=n.toString(),r=e.toString(),o=0;o<r.length-t.length;o++)n=G.STR.SPACE+n;return n}function e(n,e,t){return e+n.toString()+t}function t(n,e,t,r){return n=n.toString(),e===t?n.green:e===r?n.red:n}function r(n,e,r){var o=[];return n.forEach(function(n){o.push(t(n,n,e,r))}),o.join(G.STR.DELIMITER)}function o(n,e){return n.toString()+G.STR.DICE+e.toString()+G.STR.SPACE}function i(n){return e(n.join(G.STR.DELIMITER),G.STR.PAREN_LEFT,G.STR.PAREN_RIGHT+G.STR.SPACE)}function a(n){return e(n,G.STR.BRACK_LEFT,G.STR.BRACK_RIGHT+G.STR.SPACE)}function u(n){var e=n.toString()+G.STR.SPACE;return n<0?e.red:n>0?(G.STR.PLUS+e).green:(G.STR.PLUSMINUS+e).grey.dim}function c(n){var e=G.STR.TIMES+n.toString();return n>1?e:e.grey.dim}function f(e,t,r,o){var i=n(G.STR.SUM,r||0),a=t?G.STR.COLON+G.STR.SPACE:G.STR.SPACE;return(i+a).grey.dim+n(e,o||0)}function s(e,t,r,o,i){var a=t||r?G.STR.SPACE+G.STR.ALERT:"";a=t?a.green:r?a.red:a.grey.dim;var u=G.STR.TAB+G.STR.QUAL+G.STR.SPACE+n(e,i);return u=e<o?u.grey.dim:u,u+a+G.STR.TAB}function l(e,t){var r=G.STR.TAB+n(e,t*-1);return e<0?r.red:r.green}function g(n){return e(n,G.STR.QUOTE_LEFT,G.STR.QUOTE_RIGHT)}function h(n){return g(n).yellow+G.STR.HYPHEN.grey.dim}return{indent:n,enclose:e,roll:t,rolls:r,dice:o,attr:i,brackets:a,mod:u,times:c,sum:f,quality:s,points:l,quote:g,phrase:h}}(),Log=function(){function n(n){f((n||"")+G.STR.NL)}function e(n){for(var e=0;e<(n||1);e++)f.previousLine(1),f.eraseLine()}function t(e){e="number"!=typeof e?1:e;for(var t=0;t<e;t++)n("")}function r(e,r,o){t(r),n(e),t(o)}function o(e){e.forEach(function(t,r){n((Str.indent(r+1,e.length)+G.STR.BULLET).grey.dim+t)})}function i(n,e,t,o,i,a){var u=G.STR.SPACE.repeat(G.STR.BULLET.length),c=Str.indent(G.STR.ALERT,e||0);t=t||!1,o=o||!1,c=t?c.red:o?c.green:c.grey.dim,r(c+u+n,i,a)}function a(n,e,t,r){i(n.red,e,!0,!1,t,r)}function u(n,e,t,r){i(n.grey.dim,e,!1,!1,t,r)}function c(n,e,t,r){i(n.green,e,!1,!0,t,r)}var f=require("terminal-kit").terminal;return{spaced:r,success:c,empty:t,shout:i,error:a,hint:u,line:n,list:o,back:e}}(),Data=function(){function n(){u=require("path"),a=require("jsonfile"),c=u.join(__dirname+o),f=u.join(__dirname+i)}function e(e){n(),a.readFile(c,function(n,t){e(null!==n?{}:t)})}function t(e){n(),a.writeFile(c,e)}function r(e){n(),a.readFile(f,function(n,t){e(null!==n?{}:t)})}var o="/data.json",i="/config.json",a=null,u=null,c=null,f=null;return{config:r,load:e,save:t}}(),Update=function(){function n(n,e){Data.config(function(r){O=require("dns"),N=require("crawler"),F=r.config,q=e.force||!1,X=f(n||""),X!==!1&&s(t)})}function e(n){i();var e={maxConnections:L,rateLimit:E},t=0,a=[],u=[],c=[],f=new N(e),s=new N(e);X.forEach(function(e,r){var i=e.name,f="undefined"==typeof n[i]||q;f&&(n[i]={}),Data.save(n),a[r]=[],e.urls.forEach(function(e,f){a[r][f]=0,c.push({uri:P+e+b,callback:function(e,c,s){if(!e){var h=c.$,d=h(y).filter(function(){var e=l(h(this).text().trim());return e=n[i][e],"undefined"==typeof e}),S=d.length;t=S>t?S:t,a[r][f]=S,d.each(function(e){var t=h(this).text().trim();t=l(t);var c=h(this).attr(w);c=encodeURI(c),u.push({uri:I+c,callback:function(u,c,s){u||(n[i][t]=g(c.$,c.$(U)),Data.save(n),o(e,r,f,a,i,t),s())}})}),s()}}})})}),r([s,f],[c,u])}function t(n){n&&Data.load(e)}function r(n,e){var t=n.length;t===e.length&&n.forEach(function(r,o){0===o&&r.queue(e[o]),r.on(C,function(){if(0===o){var r=e[o+1].length;r?a(r):c()}o+1<t&&n[o+1].queue(e[o+1]),o===t-1&&u(e[o].length)})})}function o(n,e,t,r,o,i){var a=1+n;r.forEach(function(n,r){n.forEach(function(n,o){a+=r===e&&o<t||r<e?n:0})}),Log.back();var u=o+G.STR.SPACE+Str.quote(i);Log.hint(a+G.STR.BULLET+u,0,0,0)}function i(){var n=0;Log.empty(2),j=setInterval(function(){n=n>=R?0:n+1,Log.back(),Log.line(G.STR.TIC.repeat(n).green)},v)}function a(n){clearInterval(j);var e=d.replace(G.REGEX.PH,n);Log.back(),Log.success(e,0,0)}function u(){Log.back(),Log.success(S,0,0)}function c(){clearInterval(j),Log.back(),Log.success(T,0,0)}function f(n){var e=[],t=[],r=[];return F.forEach(function(o){e.push(o.name),r.push(o),o.name===n.toLowerCase()&&t.push(o)}),n.length?t.length?t:(Log.error(p,e.length,1,0),Log.hint(m,e.length,0,1),Log.list(e),Log.empty(),!1):r}function s(n){O.lookup(A,function(e){e?(Log.error(h,0,1,0),Log.hint(A,0,0,1),n(!1)):n(!0)})}function l(n){return n=n.replace(G.REGEX.LVL,""),n=n.replace(G.REGEX.STAR,""),n=n.replace(G.REGEX.DOTS,"")}function g(n,e){function t(){return 3===this.nodeType}function r(){return!n(this).text().trim().length}if(!e.length)return"";e.contents().filter(t).remove(),e.children().filter(r).remove(),e.html(e.html().split(H).join(_)),e.find(k).each(function(){n(this).replaceWith(Str.enclose(n(this).text(),G.STR.TITLE,G.STR.TITLE+G.STR.PARA))}),e.find(x).each(function(){n(this).replaceWith(Str.enclose(n(this).text(),G.STR.BOLD,G.STR.BOLD))}),e.find(B).each(function(){n(this).replaceWith(Str.enclose(n(this).text(),G.STR.ITALIC,G.STR.ITALIC))}),e.find(M).each(function(){n(this).replaceWith(G.STR.PARA)}),e.find(D).each(function(){n(this).replaceWith(Str.enclose(n(this).text(),G.STR.PARA,G.STR.PARA))});var o=e.text().trim();return o=o.replace(G.REGEX.HASH,""),o.substr(0,o.length-G.STR.PARA.length)}var h="Verbindungsfehler!",d="Update: $1 neue Begriffe gefunden",S="Update abgeschlossen",T="Begriffe sind auf dem aktuellen Stand",p="Thema existiert nicht, folgende sind verfügbar:",m="(dsa update [topic] [-f])",L=1,E=0,R=3,v=300,A="ulisses-regelwiki.de",I="http://www.ulisses-regelwiki.de/",P="http://www.ulisses-regelwiki.de/index.php/",b=".html",C="drain",y="td > a",U="#main .ce_text",k="h1",x="strong",B="em",D="p",M="br",w="href",H="<br>",_="<br/>",O=null,N=null,X=!1,q=!1,F=null,j=null;return{start:n}}(),Dice=function(){function n(n,e,t){e=Math.max(Util.toInt(e),p),mod=Util.toInt(t.mod);var r=e>p||mod,i=[],a=0;o(e,n).forEach(function(e,t){a+=e;var r=Str.indent(e,n);i.push(Str.roll(r,e,m,n))}),Log.spaced(Str.dice(e,n)+Str.mod(mod)),Log.list(i),Log.spaced(r?Str.sum(a+mod,!0,e):"",r?1:0)}function e(n,e,o){n=r(n),e=Util.toInt(e);var s=Util.toInt(o.mod),l=Math.max(Util.toInt(o.repeat),p),g=l>p,h=!1,d=!1,E=!1,R=[],G=0,A=0;if(n.length!==S)Log.error(f,0,1,0),Log.hint(c,0,0,1);else{for(var P=0;P<l;P++){var b=i(n,e,s,G),C=b.results,y=b.points,U=a(C,L)>=T,k=a(C,m)>=T,x=u(y,k,U,g),B=x<I;if(d=!!d||U,E=!!E||k,h=!!h||B,A=U?x:A+x,G=k?0:B?G+1:G,R.push(Str.rolls(C,m,L)+Str.points(y,S*L)+Str.quality(x,k,U,I,v)+Str.sum(A,!1,0,v*l)),U)break}Log.spaced(Str.dice(Str.indent(S,R.length),L)+Str.attr(n)+Str.mod(s)+Str.brackets(e)+Str.times(l)),Log.list(R),t(R.length,E,h,d)}}function t(n,e,t,r){var o=!1,i=!1,a=n>p,u=!a&&t,c=!a&&!t;a||t||(i=d.green),!a&&t&&(i=h.red),a&&t&&(i=l.grey.dim),e&&(o=g.green),r&&(o=s.red),!i&&o&&Log.empty(),i&&Log.shout(i,n,u,c,1,0),o&&Log.shout(o,n,r,e,0,1),o||Log.empty()}function r(n){var e=[];return n.split(G.STR.DELIMITER).forEach(function(n){e.push(Util.toInt(n))}),e}function o(n,e){for(var t=[],r=0;r<n;r++)t.push(Util.randomInt(1,e));return t}function i(n,e,t,r){var i=e+0,a=o(n.length,L);return a.forEach(function(e,o){var a=Math.max(0,n[o]+t-r);i-=Math.max(0,e-a)}),{results:a,points:i}}function a(n,e){var t=0;return n.forEach(function(n){t+=n===e?1:0}),t}function u(n,e,t,r){var o=Math.ceil(n/R),i=e?I:A,a=e&&r?E:t?0:1,u=0===n?I:o;return Math.max(Math.min(u*a,v),i)}var c="(z.B. 11/13/12)",f="Probe im falschen Format!",s="Patzer (automatisch misslungen)",l="Nach misslungenen Proben Malus kumulativ +1",g="Krit. Erfolg (bei Sammelprobe QS×2, Malus 0)",h="Erfolgsprobe misslungen",d="Erfolgsprobe bestanden",S=3,T=2,p=1,m=1,L=20,E=2,R=3,v=6,A=0,I=1;return{roll:n,skill:e}}(),Search=function(){function n(n,t,o){p=require("didyoumean"),p.nullResultValue=!1,t=(t||"").toLowerCase(),n=(n||"").toLowerCase();var i=o.guess||!1,a=o.fuzzy||!1;Data.load(function(o){var u=Object.keys(o).sort(Util.sortAlpha),c=r(n,u),f=0===n.length,s=u.length,T=f?g.green:l.red;s&&c?e(o[c],t,c,a,i):s?(Log.shout(T,s,!f,f),Log.list(u),Log.hint(h,s)):(Log.error(d,s,1,0),Log.hint(S,s,0,1))})}function e(n,e,r,l,g){var h=0===e.length,d=(Str.phrase(e),Object.keys(n)),S=!1,p=[],m=h?f:c,L=s.replace(G.REGEX.PH,r),E=T.replace(G.REGEX.PH,r);d.forEach(function(n){e===n?S=n:t(e,n,l)&&p.push(n)}),p.sort(Util.sortAlpha);var R=S?S:o(e,p,g),v=p.length;R?Log.spaced(i(n[R])):v?(Log.success(m,v),Log.list(p),Log.hint(L,v)):h&&!v?(Log.error(u,v,1,0),Log.hint(E,v,0,1)):(Log.error(a,v,1,0),Log.hint(L,v,0,1))}function t(n,e,t){var r=t?require("fuzzysearch"):function(){return!1};return n=n.toLowerCase(),e=e.toLowerCase(),n.indexOf(e)!==-1||r(n,e)||e.indexOf(n)!==-1||r(e,n)}function r(n,e){return e.indexOf(n)>=0?n:p(n,e)}function o(n,e,t){return p.threshold=null,p.thresholdAbsolute=100,!!t&&p(n,e)}function i(n){return n=n.replace(G.REGEX.PARA,G.STR.NL),n=n.replace(G.REGEX.TITLE,G.REGEX.PH.green),n=n.replace(G.REGEX.BOLD,G.REGEX.PH.blue),n=n.replace(G.REGEX.ITALIC,G.REGEX.PH.yellow)}var a="Kein passender Begriff gefunden.",u="Keine Begriffe verfügbar.",c="Folgende Begriffe wurden gefunden:",f="Folgende Begriffe sind verfügbar",s="(dsa search $1 [phrase] [-f] [-g])",l="Thema existiert nicht, folgende sind verfügbar:",g="Folgende Themen sind verfügbar:",h="(dsa search [topic] [phrase] [-f] [-g])",d="Keine Daten gefunden!",S="(dsa update [topic] [-f])",T="(dsa update $1 [-f])",p=null;return{find:n}}();!function(){Program.version("0.0.1").description("CLI tools for The Dark Eye"),[3,4,6,8,10,12,20,100].forEach(function(n){Program.command("d"+n+" [n]").description("roll d"+n+" n times").option("-m, --mod <x>","modify sum by x").action(function(e,t){Dice.roll(n,e,t)})}),Program.command("skill <attributes> <value>").description("make skill check").option("-m, --mod <x>","modify check by x").option("-r, --repeat <n>","repeat check n times").action(function(n,e,t){Dice.skill(n,e,t)}),Program.command("search [topic] [phrase]").description("search for phrase in topic").option("-f, --fuzzy","use fuzzy search").option("-g, --guess","guess correct result").action(function(n,e,t){Search.find(n,e,t)}),Program.command("update [topic]").description("update search database").option("-f, --force","force update").action(function(n,e){Update.start(n,e)}),Program.parse(process.argv),Program.args.length||Program.help()}();