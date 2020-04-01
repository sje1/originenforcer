

function percent(a, b){
  if(!a || !b) return 0;
  if(b == 0) return 0;
  return Math.round((a/b)*100);
}

var tips = ['only allow the mimimum number of sites that make a website work!', 'keep blocking anything that looks fishy!', 'block ad systems, like amazon-adsystem.com or aaxads.com!', 'block surveillance systems, like googletagservices.com or googletagmanager.com!', 'block anything going to google or facebook!', 'look at all the tracking calls every time you visit a website!', 'if a site does not load, contact them and tell them about all the calls going to third parties!','Block any third party analysis like optimizely.com or googleanalytics.com!', 'Be wary of sites that do not load, or use a large number of third parties!', 'Be critical and wary of sites using many third parties or do not load...do not use them, or contact them about it!', 'This puts you in complete control of the tracking and surveillance, not the greedy web sites and third parties tracking your every move!', 'Google and facebook have hacked the internet protocols and standards by placing secret code in so many websites, make sure you leave it all blocked!','Google and facebook use all sorts of tricks like fake image requests, and fake plugins to track you...make sure you block them all!','We cannot trust web site owners to do the right thing, they all have put secret tracking code from numberous third parties into their websites without your concent or knowledge, make sure it is all blocked!','The web security model is broken, big corporations like google and microsoft release browsers that are purposefully not secure...make sure you use firefox and this plugin!','The security model of the web is broken, incorrect and purposefully broken security models are used, leaving you tracked by websites and browser makers...by design!','This addon enforces the simple rule that the people must control the security, not the website owners or browsers that have shown to be unethical!','Websites should only make requests back to itself...not to other companies or third parties!','Replace google.com with duckduckgo.com for searching to be safe online!','Replace your default browser with Firefox to be safe online (and use this addon!)', 'Thie is a website sandbox, the correct security model for websites, where you the user controls what requests are made, not the website owners!', 'If a website does not work because of this plugin, the site is breaking essential security and safety rules of same origin!','Look at all the third party invasive tracking calls made by the website!','Help cleanup the web, block all the calls to third parties and tracking, it also cuts down on internet pollution!','Clean sites that care about privacy are duckduckgo.com and torproject.org!','Enable third party domains, maybe even temporarily, to view some content, then blacklist it again!','Reject sites that are a blight on the internet, like accuweather.com!','Sites should not call any 3rd parties, even for common scripts. It is never safe to pull or request data from external sites for security reasons!','If a site relies on third parties for their content, reject that site, and visit the third parties directly!','Websites should declare what third parties they use, why and who owns the domains... then users should decide which domains are ok to enable!','Many sites use another domain for content (cdn - content delivery network), so sometimes just enabling those domains are ok. e.g quora.com uses quoracnd.net','Just unable domains that might be used for images, but not scripts!','notice that almost all websites make calls back to google and facebook for tracking your every move!'];

function tip(){
  return tips[Math.floor(Math.random() * tips.length)]; 
}

// layout the sidebar info, all the data, blocked and allowed calls, stats, recent calls...
function tabinforeply(msg){
  var myhost = msg.data.host;
  var mydomain = msg.data.domain;

  // origin calls!
  var origincounts = {};
  if(msg.data && msg.data.hosttohostcounts && (mydomain in msg.data.hosttohostcounts)){
    origincounts = msg.data.hosttohostcounts[mydomain];
  }

  document.getElementById('tipid').textContent = ''+tip();

  document.getElementById('originheader').textContent = '' + mydomain;

  var totalcalls = '<span title="These are all the thirdparty and background calls and cookies blocked by the origin enforcer...the more the better!">I have blocked</span><br>- ' + msg.data.blockedCount + ' call' + (msg.data.blockedCount==1?'':'s') + ' of ' + msg.data.totalCount + ' ('+percent(msg.data.blockedCount,msg.data.totalCount)+'%)<br>- ' + msg.data.blockedCookieCount + ' cookie' + (msg.data.blockedCookieCount==1?'':'s') + ' of ' + msg.data.totalCookieCount + ' ('+percent(msg.data.blockedCookieCount,msg.data.totalCookieCount)+'%)';

  var origincalls = '<span title="These are thirdparty and background calls and cookies blocked by the origin enforcer going to places other than '+mydomain+' since '+msg.data.since+'">For this site, I have blocked</span>  (<span id="event/runtimereset/'+mydomain+'" style="cursor:pointer;" title="Reset the counts back to zero for calls and cookies blocked for this domain">reset stats</span>)<br>- ' + msg.data.blockedByHostCount + ' call' + (msg.data.blockedByHostCount==1?'':'s') + ' of ' + msg.data.totalByHostCount + ' ('+percent(msg.data.blockedByHostCount, msg.data.totalByHostCount)+'%)<br>- ' + msg.data.blockedCookieByHostCount + ' cookie' + (msg.data.blockedCookieByHostCount==1?'':'s') + ' of ' + msg.data.totalCookieByHostCount + ' ('+percent(msg.data.blockedCookieByHostCount,msg.data.totalCookieByHostCount)+'%)';

  document.getElementById('intro').innerHTML = totalcalls;
  document.getElementById('originintro').innerHTML = origincalls;
  document.getElementById('origincalls').textContent = mydomain+' ('+ (origincounts&&origincounts.calls?origincounts.calls:0)+' calls, '+(origincounts&&origincounts.cookies?origincounts.cookies:0)+' cookies)';

  document.getElementById('myhostname').textContent = mydomain;
  document.getElementById('myhostname1').textContent = mydomain;
  document.getElementById('myhostname2').textContent = mydomain;

  document.getElementById('event/sitepolicy/allowall').value = mydomain + '/' + host;
  document.getElementById('event/sitepolicy/allowallnocookies').value = mydomain + '/' + host;
  document.getElementById('event/sitepolicy/enforce').value = mydomain + '/' + host;

  if(msg.data.hostsettings && msg.data.hostsettings.sitepolicy){
    var p = msg.data.hostsettings.sitepolicy;
    if(p === 'allowall') {
      document.getElementById('event/sitepolicy/allowall').checked = true;
      document.getElementById('enforcepanel').style.opacity = 0.3;
    } else if(p === 'allowallnocookies') {
      document.getElementById('event/sitepolicy/allowallnocookies').checked = true;
      document.getElementById('enforcepanel').style.opacity = 0.3;
    } else {
      document.getElementById('event/sitepolicy/enforce').checked = true; 
      document.getElementById('enforcepanel').style.opacity = 1.0;
    }
  } else {
    document.getElementById('event/sitepolicy/enforce').checked = true;
    document.getElementById('enforcepanel').style.opacity = 1.0;
  }


  var list = msg.data.whitelisthost.sort();
  var container = document.getElementById('whitelistedhost');
  while (container.hasChildNodes()) { container.removeChild(container.lastChild); }
  for(var i = 0; list && i < list.length; i++) {
    var host = list[i];
    var counts = msg.data.hosttohostcounts[host];
    var div = document.createElement('div');
    div.id = 'wlh' + i;
    div.innerHTML = '<span id="event/unwhitelist/' + mydomain + '/' + host + '" title="Remove and disallow calls to here from this site" class="demote">&darr;</span> <span class="allowed" title="Allowing requests to '+host+'">' + host + countString(counts) + '</span>';
    container.appendChild(div);
  }

  list = msg.data.newwlh.sort();
  container = document.getElementById('blocked');
  while (container.hasChildNodes()) { container.removeChild(container.lastChild); }
  for(var i = 0; list && i < list.length; i++) {
    var h = list[i]; 
    var counts = msg.data.hosttohostcounts[h];
    var div = document.createElement('div');
    div.id = 'wlch' + i;
    div.innerHTML = '<span id="event/whitelist/' + mydomain + '/' + h + '" title="Allow calls to here from this site" class="promote">&uarr;</span> <span class="hostblock" title="Blocking all requests to ' + h + '">' + h + countString(counts) + '</span>';
    container.appendChild(div);
  }

  list = msg.data.cancellist;
  container = document.getElementById('recentblocks');
  for(var i = 0; list && i < list.length; i++) { // list cancellations in great detail...most recent first!
    var b = list[list.length-1-i];
    var id = 'blk' + i;
    var htm = '<span class="callblockcross">&#10007;</span> <span class="recentblock" title="Blocked ' + b.method + ' request for ' + b.type + ' from ' + b.refhost + ' to ' + b.url + ' at ' + new Date(b.timeStamp) + '">' + b.method + ' ' + b.type + ' from ' + b.urlhost + ' (' + b.reason + ') ' + (b.cookieCount && b.cookieCount > 0 ? '(' + b.cookieCount + ' cookie'+(b.cookieCount==1?'':'s')+')':'') + '</span>';
    var existing = document.getElementById(id);
    if(!!existing) { 
      existing.innerHTML = htm; 
    } else {
      var div = document.createElement('div');
      div.id = id;
      div.innerHTML = htm;
      container.appendChild(div);
    }
  }
  for(var i = list.length; i <= 100; i++){
    var existing = document.getElementById('blk'+i);
    if(existing) container.removeChild(existing);
  }
}

// pretty print a display of call and cookie counts
function countString(counts){
  if(!counts) return '';
  if(!counts.calls && !counts.cookies) return '';
  if(counts.calls < 1 && counts.cookies < 1) return '';
  if(counts.calls > 0) {
    var h = ' (' + counts.calls + ' call' + (counts.calls==1?'':'s');
    if(counts.cookies > 0) h = h + ', ' + counts.cookies + ' cookie' + (counts.cookies==1?'':'s');
    h = h + ')';
    return h;
  } else if(counts.cookies > 0) { 
    return ' (' + counts.cookies + ' cookie' + (counts.cookies==1?'':'s') + ')';
  } else {
    return '';
  }
}

// call the background to get tab info
function updateTab() {
  var querying = browser.tabs.query({currentWindow: true, active: true});
  querying.then(function(tabs){
    for (let tab of tabs) {
      if(typeof tab.url === 'undefined') continue;
      if(tab.url == null) continue;
      varm = browser.runtime.sendMessage({ type: 'tabinfo', tabId: tab.id, url: tab.url});
      varm.then(tabinforeply);
    }
  });
}

function updateContent(){ // load data and update the sidebar
  const g = browser.storage.local.get();
  g.then(function(m) { data = m; updateTab(); }); 
}

browser.tabs.onActivated.addListener(updateTab);
browser.tabs.onUpdated.addListener(updateTab);

// handle the sidebar clicks and events here...
if (document.addEventListener) {
    document.addEventListener('click', interceptClickEvent);
} else if (document.attachEvent) {
    document.attachEvent('onclick', interceptClickEvent);
}

// just support a few events, like whitelisting and dewhitelisting domains on a tab
function interceptClickEvent(e){
  var target = e.target || e.srcElement;
  if(target.id && target.id.startsWith('event/')){
    e.preventDefault();
    var ss = target.id.split('/');
    if(ss[1] === 'whitelist'){ 
      var varm = browser.runtime.sendMessage({ type: 'whitelist', refhost: ss[2], urlhost: ss[3] });
      varm.then(function(msg){ updateContent(); });
    } else if(ss[1] === 'unwhitelist'){
      var varm = browser.runtime.sendMessage({ type: 'unwhitelist', refhost: ss[2], urlhost: ss[3] });
      varm.then(function(msg){ updateContent(); });
    } else if(ss[1] === 'downgrade'){ // downgrade whitelist from * to host based
      var varm = browser.runtime.sendMessage({ type: 'downgrade', refhost: ss[2], urlhost: ss[3] });
      varm.then(function(msg){ updateContent(); });
    } else if(ss[1] === 'sitepolicy'){
      //if(ss[2] === 'allowall') {
      //  if(!confirm('Are you sure you want to allow this site to make calls anywhere? At any time, this site can add in calls to other places without you knowing!')){ return; };
      //} else if(ss[2] === 'allowallnocookies') {
      //  if(!confirm('Are you sure you want to allow this site to make calls anywhere? Even without cookies, at any time, this site can add in calls to other places without you knowing!')){ return; };
      //}
      var vals = target.value.split('/')
      var varm = browser.runtime.sendMessage({ type: 'sitepolicy', sitepolicy: ss[2], refhost: vals[0], urlhost: vals[1] });
      varm.then(function(msg){ updateContent(); });
    } else if(ss[1] === 'runtimereset') {
      var varm = browser.runtime.sendMessage({ type: 'runtimereset', refhost: ss[2], urlhost: ss[3] });
      varm.then(function(msg){ updateContent(); });
    } else {
      // unknown event
    }

  } else { // not an event for us..!
  }
}

