const script = document.createElement("script");
script.src = chrome.runtime.getURL("js/manager.js");
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();