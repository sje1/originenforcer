
var odata = {};  // data to store in local storage
odata.created = new Date().getTime();

function initdata(){
  // just keep some global aggregates for the plugin!
  odata.cancelCount = 0;
  odata.totalCount = 0;
  odata.blockedCookieCount = 0;
  odata.totalCookieCount = 0;

  // setup default whitelists on alexa top 100 sites (so at least some of the large sites start off working!) 
  odata.getwhitelists = {};
  odata.getwhitelists['github.com'] = ['githubassets.com','githubapp.com','octocapture.com'];
  odata.getwhitelists['nytimes.com'] = ['nyt.com'];
  odata.getwhitelists['reddit.com'] = ['redditmedia.com','redditstatic.com','v.redd.it','preview.redd.it'];
  odata.getwhitelists['yahoo.com'] = ['yimg.com'];
  odata.getwhitelists['yahoo.co.jp'] = ['c.yimg.jp','s.yimg.jp'];
  odata.getwhitelists['stackoverflow.com'] = ['sstatic.net','imgur.com'];
  odata.getwhitelists['bbc.co.uk'] = ['bbci.co.uk'];
  odata.getwhitelists['bbc.com'] = ['bbci.co.uk','bbc.co.uk'];
  odata.getwhitelists['youtube.com'] = ['google.com','googleapis.com','googlevideo.com','gstatic.com','ytimg.com'];
  odata.getwhitelists['facebook.com'] = [''];
  odata.getwhitelists['google.com'] = ['gstatic.com'];
  odata.getwhitelists['wikipedia.org'] = ['wikimedia.org'];
  odata.getwhitelists['amazon.com'] = ['ssl-images-amazon.com'];
  odata.getwhitelists['twitter.com'] = ['twimg.com'];
  odata.getwhitelists['live.com'] = ['microsoft.com','msecnd.net','office365.com'];
  odata.getwhitelists['microsoft.com'] = ['live.com','akamaized.net','s-microsoft.com'];
  odata.getwhitelists['office.com'] = ['microsoft.com','microsoftonline.com','akamaized.net','msocdn.com'];
  odata.getwhitelists['twitch.tv'] = ['twitchcdn.net','twitchsvc.net','ttvnw.net'];
  odata.getwhitelists['imdb.com'] = ['media-imdb.com','media-amazon.com'];
  odata.getwhitelists['pornhub.com'] = ['phncdn.com'];
  odata.getwhitelists['aliexpress.com'] = ['alicdn.com'];
  odata.getwhitelists['xvideos.com'] = ['xvideos-cdn.com'];
  odata.getwhitelists['youporn.com'] = ['phncdn.com','ypncdn.com'];
  odata.getwhitelists['livejasmin.com'] = ['dditscdn.com'];
  odata.getwhitelists['xhamster.com'] = ['xhcdn.com','ahcdn.com'];
  odata.getwhitelists['naver.com'] = ['pstatic.net'];
  odata.getwhitelists['ebay.com'] = ['ebaystatic.com','ebayimg.com'];
  odata.getwhitelists['bilibili.com'] = ['hdslb.com'];
  odata.getwhitelists['netflix.com'] = ['nflxext.com','nflximg.net'];
  odata.getwhitelists['whatsapp.com'] = ['whatsapp.net'];
  odata.getwhitelists['pinterest.com'] = ['pinimg.com'];
  odata.getwhitelists['quora.com'] = ['quoracdn.net'];
  odata.getwhitelists['xnxx.com'] = ['xnxx-cdn.com','xvideos.com'];
  odata.getwhitelists['sogou.com'] = ['sogoucdn.com'];
  odata.getwhitelists['amp.dev'] = ['ampproject.org','ytimg.com'];
  odata.getwhitelists['bitly.com'] = ['cloudfront.net'];
  odata.getwhitelists['apple.com'] = ['cdn-apple.com'];
  odata.getwhitelists['dell.com'] = ['dellcdn.com'];
  odata.getwhitelists['cincinnati.com'] = ['gannett-cdn.com'];
  odata.getwhitelists['nbcnews.com'] = ['s-nbcnews.com'];
  odata.getwhitelists['csbnews.com'] = ['cbsistatic.com'];
  odata.getwhitelists['cnbc.com'] = ['cnbcfm.com'];
  odata.getwhitelists['usatoday.com'] = ['gannett-cdn.com'];
  odata.getwhitelists['engadget.com'] = ['aolcdn.com','blogsmithmedia.com'];
  odata.getwhitelists['globalnews.ca'] = ['wp.com'];
  odata.getwhitelists['nationalpost.com'] = ['wp.com','wordpress.com'];
  odata.getwhitelists['haaretz.com'] = ['haarets.co.il'];
  odata.getwhitelists['cbs46.com'] = ['townnews.com'];
  odata.getwhitelists['newegg.com'] = ['neweggimages.com'];
  odata.getwhitelists['scmp.com'] = ['i-scmp.com'];
  odata.getwhitelists['washingtonexaminer.com'] = ['brightspotcdn.com'];
  odata.getwhitelists['statista.com'] = ['statcdn.com'];
  odata.getwhitelists['tripadvisor.com'] = ['tacdn.com'];
}

var rdata = {}; // runtime only data

// load stored data
const getpromise = browser.storage.local.get();
getpromise.then(function(m) {
  if(typeof m === 'undefined' || !m) { initdata(); return; }
  if(typeof m.created === 'undefined' || !m.created) { initdata(); return; }
  odata = m; // use loaded one
});


function getproto(url){
  var i1 = url.indexOf('://');
  return i1 == -1 ? '' : url.substring(0, i1);
}
function gethost(url){
  var i3 = url.indexOf('://');
  var i4 = url.indexOf('/', i3+3);
  return i4 == -1 ? url.substring(i3+3) : url.substring(i3+3, i4);
}

// ccTLD and iso 3166-1 two letter country codes used for country top level domains...
var iso2 = ['uk','gb','au','nz','cn','us','su','ru','eu','jp','tw','ca','de','fr','br','at','hu','il','za','kr','es','th','ua','nl','ac','af','ag','ai','am','bo','by','bz','cm','cr','cz','cx','dj','dk','fm','gd','gg','gl','gp','gs','gt'];
var iso2not = ['com','org','gov','net','edu','mil','tv']; // tv is not...but used like a main top level..

function getdomain(host){  // chop off subdomains...lots of exceptions to rules here...
  var i1 = host.lastIndexOf('.');
  if(i1 == -1) return host;
  var level1 = host.substring(i1+1);
  var i2 = host.lastIndexOf('.', i1-1);
  if(i2 == -1) return host;
  var level2 = host.substring(i2+1);

  if(iso2not.includes(level1)){ return level2; }

  var i3 = host.lastIndexOf('.', i2-1);
  if(i3 == -1) return host;
  var level3 = host.substring(i3+1);
  return level3;
}

function bgHandleMessage(request, sender, sendResponse) {
  if(request.type === 'whitelist'){ // whitelist a third party domain for some domain
    if(!request.refhost) { sendResponse({ success: false, msg: 'refhost missing', odata: odata}); return; }
    if(!request.urlhost) { sendResponse({ success: false, msg: 'urlhost missing', odata: odata}); return; }
    var refdomain = getdomain(request.refhost);
    var urldomain = getdomain(request.urlhost);
    if(!(refdomain in odata.getwhitelists)) odata.getwhitelists[refdomain] = [ urldomain ];
    else if(!odata.getwhitelists[refdomain].includes(urldomain)) odata.getwhitelists[refdomain].push(urldomain);
    browser.storage.local.set(odata);
    sendResponse({ success: true, msg: 'added ' + urldomain + ' to ' + refdomain, refhost: request.refhost, urlhost: request.urlhost, refdomain:refdomain, urldomain:urldomain });

  } else if(request.type === 'unwhitelist'){  // unwhitelist a third party domain for some domain
    if(!request.refhost) { sendResponse({ success: false, msg: 'refhost missing', odata: odata}); return; }
    if(!request.urlhost) { sendResponse({ success: false, msg: 'urlhost missing', odata: odata}); return; }
    var refdomain = getdomain(request.refhost);
    var urldomain = getdomain(request.urlhost);
    var index = odata.getwhitelists[refdomain].indexOf(urldomain);
    if (index > -1) { odata.getwhitelists[refdomain].splice(index, 1); }
    browser.storage.local.set(odata);
    sendResponse({ success: true, msg: 'removed ' + urldomain + ' from ' + refdomain, refhost: request.refhost, urlhost: request.urlhost, refdomain:refdomain, urldomain:urldomain });

  } else if(request.type === 'downgrade'){  // downgrade a global third party whitelist to a domain specific whitelist
    if(!request.refhost) { sendResponse({ success: false, msg: 'refhost missing', odata: odata}); return; }
    if(!request.urlhost) { sendResponse({ success: false, msg: 'urlhost missing', odata: odata}); return; }
    var refdomain = getdomain(request.refhost);
    var urldomain = getdomain(request.urlhost);
    var index = odata.getwhitelists['*'].indexOf(urldomain);
    if (index > -1) { odata.getwhitelists['*'].splice(index, 1); }
    if(!(refdomain in odata.getwhitelists)) odata.getwhitelists[refdomain] = [ urldomain ];
    else if(!odata.getwhitelists[refdomain].includes(urldomain)) odata.getwhitelists[refdomain].push(urldomain);
    browser.storage.local.set(odata);
    sendResponse({ success: true, msg: 'removed ' + urldomain + ' from ' + refdomain, refhost: request.refhost, urlhost: request.urlhost, refdomain:refdomain, urldomain:urldomain });

  } else if(request.type === 'tabinfo') { // get info for a current tab
    if(!request.url) { sendResponse({ success: false, msg: 'host missing', odata: odata}); return; }
    if(!request.tabId) { sendResponse({ success: false, msg: 'tabId missing', odata: odata}); return; }
    var host = gethost(request.url);
    var domain = getdomain(host);

    if(!('bydomain' in rdata)) rdata.bydomain = {};
    if(!(domain in rdata.bydomain)) rdata.bydomain[domain] = {}
    var c = rdata.bydomain[domain];

    var ch = [];
    if(c && c.cancelleddomains) {
      ch = c.cancelleddomains;
    }
    var cancellist = [];
    if(c && c.cancellist) {
      cancellist = c.cancellist;
    }
    var wls = [];
    if(odata && odata.getwhitelists && odata.getwhitelists['*']) {
      wls = odata.getwhitelists['*'];
    }
    var wlh = [];
    if(odata && odata.getwhitelists && odata.getwhitelists[domain]) {
      wlh = odata.getwhitelists[domain];
    }
    var cancelledbyhostcount = 0;
    if(c && c.cancelled) {
      cancelledbyhostcount = c.cancelled;
    }
    var totalbyhostcount = 0;
    if(c && c.calls) {
      totalbyhostcount = c.calls;
    }
    var cancelledcookiebyhostcount = 0;
    if(c && c.cancelledcookies){
      cancelledcookiebyhostcount = c.cancelledcookies;
    }
    var totalcookiebyhostcount = 0;
    if(c && c.cookies) {
      totalcookiebyhostcount = c.cookies;
    }
    var newwlh = []; // whitelist proposals
    for(var h = 0; h < ch.length; h++){
        var hc = ch[h];
        if(!wls.includes(hc) && !wlh.includes(hc) && !newwlh.includes(hc)) newwlh.push(hc);
    }
    if(!('todomain' in c)) c.todomain = {};
    var hosttohostcounts = c.todomain;

    sendResponse({ success: true, msg: 'found', data: { url: request.url, host: host, domain: domain, tabId: request.tabId, whiteliststar: wls, whitelisthost: wlh, newwlh: newwlh, cancelledbyhost: ch, cancellist: cancellist, blockedByHostCount: cancelledbyhostcount, blockedCount: odata.cancelCount, totalCount: odata.totalCount, totalByHostCount: totalbyhostcount, blockedCookieCount: odata.blockedCookieCount, totalCookieCount: odata.totalCookieCount, blockedCookieByHostCount: cancelledcookiebyhostcount, totalCookieByHostCount: totalcookiebyhostcount, hosttohostcounts: hosttohostcounts }});

  } else {
    sendResponse({ success: false, msg: 'missing type'});
  }
}

browser.runtime.onMessage.addListener(bgHandleMessage);

function beforeSendHeaders(details) {

  if(details.type === 'main_frame') return; // just a link!
  if (typeof details.url === 'undefined' || details.url == null) { return; }

  details.ref = findRefererHeader(details); // no referer, just skip
  if (typeof details.ref === 'undefined' || details.ref == null) { return; }

  details.host = findHostHeader(details);
  details.cookie = findCookieHeader(details);
  details.cookieCount = (details.cookie == null ? 0 : details.cookie.split(';').length);
  details.refproto = getproto(details.ref);
  details.urlproto = getproto(details.url);
  details.refhost = gethost(details.ref);
  details.urlhost = gethost(details.url);
  details.refdomain = getdomain(details.refhost);
  details.urldomain = getdomain(details.urlhost);

  // track persistent data
  odata.totalCount = odata.totalCount + 1;
  if(!odata.totalCookieCount) odata.totalCookieCount = details.cookieCount;
  else odata.totalCookieCount = odata.totalCookieCount + details.cookieCount;

  // runtime data
  if (typeof rdata === 'undefined') rdata = {};
  if(typeof rdata.bydomain === 'undefined') rdata.bydomain = {};
  if(!(details.refdomain in rdata.bydomain)) rdata.bydomain[details.refdomain] = {};
  var c = rdata.bydomain[details.refdomain];

  // counts by ref
  if(!c.calls) c.calls = 1;
  else c.calls = c.calls + 1;
  if(!c.cookies) c.cookies = details.cookieCount;
  else c.cookies = c.cookies + details.cookieCount;

  // counts by ref to host
  if(!c.todomain) c.todomain = {};
  if(!(details.urldomain in c.todomain)) c.todomain[details.urldomain] = {};
  var d = c.todomain[details.urldomain];

  if(!d.calls) d.calls = 1;
  else d.calls = d.calls + 1;
  if(!d.cookies) d.cookies = details.cookieCount;
  else d.cookies = d.cookies + details.cookieCount;

  if(details.refproto === 'https' && details.urlproto === 'http') {
    return docancel(details, 'protocol downgrade'); // bad...always block this!
  }

  if(details.refhost === details.urlhost) {  return; }  // good, full host match
  if(details.refdomain === details.urldomain) {  return; } // good enough, domain matches

  // check whitelists
  if(odata && odata.getwhitelists){
    var stars = odata.getwhitelists['*'];
    for(var i = 0; stars && i < stars.length; i++) {
      if(details.urlhost === stars[i] || details.urlhost.endsWith('.'+stars[i])) { return; } // global whitelist ok!
      if(details.urldomain === stars[i] || details.urldomain.endsWith('.'+stars[i])) { return; } // global whitelist ok!
    }
    var hosts = odata.getwhitelists[details.refhost];
    for(var i = 0; hosts && i < hosts.length; i++) {
      if(details.urlhost === hosts[i] || details.urlhost.endsWith('.'+hosts[i])) { return; } // host based whitelist ok!
      if(details.urldomain === hosts[i] || details.urldomain.endsWith('.'+hosts[i])) { return; } // host based whitelist ok! 
    }
    if(details.refhost !== details.refdomain) {
      var domains = odata.getwhitelists[details.refdomain];
      for(var i = 0; domains && i < domains.length; i++) {
        if(details.urldomain === domains[i] || details.urldomain.endsWith('.'+domains[i])) { return; } // domain based whitelist ok! 
        if(details.urlhost === domains[i] || details.urlhost.endsWith('.'+domains[i])) { return; } // domain based whitelist ok!
      }
    }
  }

  return docancel(details, 'not origin');
}

var lastsave;

function docancel(details, reason){

    var m = { requestId: details.requestId, reason: reason, type: details.type, method: details.method, url: details.url, referer: details.ref, refhost:details.refhost, refdomain:details.refdomain, tabId: details.tabId, timeStamp: details.timeStamp, urlhost: details.urlhost, urldomain: details.urldomain, cookieCount: details.cookieCount };

    // save data
    if(odata.cancelCount) odata.cancelCount = odata.cancelCount + 1;
    else odata.cancelCount = 1;

    if(odata.blockedCookieCount) odata.blockedCookieCount = odata.blockedCookieCount + details.cookieCount;
    else odata.blockedCookieCount = details.cookieCount;

    var c = rdata.bydomain[details.refdomain];
    
    // counts by domain
    if(!c.cancelled) c.cancelled = 1;
    else c.cancelled = c.cancelled + 1;
    if(!c.cancelledcookies) c.cancelledcookies = details.cookieCount;
    else c.cancelledcookies = c.cancelledcookies + details.cookieCount;

    // keep recent cancellation details for the domain (up to 100)
    if(!c.cancellist) c.cancellist = [];
    if(c.cancellist.length >= 50) c.cancellist.splice(0, 1);
    c.cancellist.push(m);

    // keep cancelled domains by domain for whitelisting proposals
    if(!c.cancelleddomains) c.cancelleddomains = [];
    if(!c.cancelleddomains.includes(details.urldomain)) c.cancelleddomains.push(details.urldomain);

    // counts for domain to domain
    if(!c.todomain) c.todomain = {};
    if(!(details.urldomain in c.todomain)) c.todomain[details.urldomain] = {};
    var d = c.todomain[details.urldomain];
    if(!d.cancelled) d.cancelled = 1;
    else d.cancelled = d.cancelled + 1;
    if(!d.cancelledcookies) d.cancelledcookies = details.cookieCount;
    else d.cancelledcookies = d.cancelledcookies + details.cookieCount;
    
    // occasional save to lower overhead...
    var now = new Date().getTime()
    if(!lastsave || ((now - lastsave) > 300000)){
      browser.storage.local.set(odata);
      lastsave = now;
    }

    return {cancel:true};
}


browser.webRequest.onBeforeSendHeaders.addListener(beforeSendHeaders, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);

// helpers...
function findRefererHeader(details){ return findHeader('Referer', details); }
function findHostHeader(details){ return findHeader('Host', details); }
function findCookieHeader(details) { return findHeader('Cookie', details); }
function findHeader(headerToFind, details){
  if(!details.requestHeaders) return;
  for (var header of details.requestHeaders) {
    if(header.name && header.name === headerToFind) return header.value;
  }
  return;
}

