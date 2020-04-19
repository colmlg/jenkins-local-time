function start() {
    if(document.body.id != 'jenkins') {
        // This is not a jenkins server, nothing to do here
        return;
    }
    transformDateTimes()
}

function transformDateTimes() {
    transformBuildTimes()
    transformConfigHistoryTimes()
    transformChangesPageTimes()
    transformBuildPageTime()
}

function transformBuildTimes() {
    modifyEventListener('removeEventListener') // Remove the listener to avoid recursion as we are about to modify the element
    for (let element of document.querySelectorAll('div[time]')) {
        const timestamp = parseInt(element.getAttribute('time'));
        element.firstChild.innerHTML =  moment(timestamp).format('DD-MMM-YYYY HH:mm');
    }
    modifyEventListener('addEventListener') // Listen for changes to build times, as they are periodically refreshed
}

function transformConfigHistoryTimes() {
    const table = document.getElementById('confighistory');

    if(!table) {
        return
    }

    for (let i = 1; i < table.rows.length; i++) {
        const tableDate = table.rows[i].cells[0].innerHTML;
        table.rows[i].cells[0].innerHTML = moment(tableDate, 'YYYY-MM-DD_HH-mm-ss').format('YYYY-MM-DD_HH-mm-ss');
    }
}

function transformChangesPageTimes() {
    const elements = document.querySelectorAll("#main-panel h2 a[href$=changes]");
    const DATE_LENGTH = 20;

    for (let element of elements) {
        const stringLength = element.innerHTML.length;
        const dateString = element.innerHTML.substring(stringLength - (DATE_LENGTH + 1), stringLength -1) // #381 \n  (13-Mar-2020 08:38:31)
        const dateWithTimeZone = `${dateString} ${getServerTimeZone()}`
        const localDate = moment(dateWithTimeZone);

        if(!localDate.isValid()) {
            continue
        }

        element.innerHTML = element.innerHTML.replace(dateString, localDate.format('DD-MMM-YYYY HH:mm:ss'))
    }
}

function transformBuildPageTime() {
    const title = document.querySelector("#main-panel h1");
    const DATE_LENGTH = 20; // Length of "13-Mar-2020 08:38:31"
    const trimmedTitle = title.innerHTML.trim();
    const stringLength = trimmedTitle.length;
    const dateString = trimmedTitle.substring(stringLength - (DATE_LENGTH + 1), stringLength - 1) // #381 \n  (13-Mar-2020 08:38:31)
    const dateWithTimeZone = `${dateString} ${getServerTimeZone()}`
    const localDate = moment(dateWithTimeZone);

    if(!localDate.isValid()) {
        return
    }

    title.innerHTML = trimmedTitle.replace(dateString, localDate.format('DD-MMM-YYYY HH:mm:ss'))
}

function getServerTimeZone() {  // Page generated: 14-Mar-2020 06:49:02 PDT -> PDT
    const serverTime = document.getElementsByClassName('page_generated')[0].textContent;
    const serverTimeZone = serverTime.substring(serverTime.length - 3);
    return serverTimeZone;
}

function modifyEventListener(action) {
    const history = document.getElementById('buildHistory')
    if (!history) {
        return
    }
    const modifyFunction = history[action]
    modifyFunction('DOMSubtreeModified',  transformBuildTimes)
}

start();
