
 function isMSIEBrowser(){

    var dataString = navigator.userAgent;
    if (dataString.indexOf("MSIE") !== -1 || dataString.indexOf("Trident") !== -1)
        return true;
    else
        return false;
}

function isChromeBrowser(){

    var dataString = navigator.userAgent;
    if (dataString.indexOf("Chrome") !== -1)
        return true;
    else
        return false;
}