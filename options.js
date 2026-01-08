function saveOptions() {
    const seanimeUrl = document.querySelector('#seanimeUrl').value.trim() || 'http://127.0.0.1';
    const seanimePort = document.querySelector('#seanimePort').value.trim() || '43211';

    chrome.storage.sync.set({
        seanimeUrl: seanimeUrl,
        seanimePort: seanimePort
    });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
}

function updatePreview() {
    const url = document.querySelector('#seanimeUrl').value.trim() || 'http://127.0.0.1';
    const port = document.querySelector('#seanimePort').value.trim() || '43211';
    document.querySelector('#previewUrl').textContent = `${url}:${port}`;
}

function restoreOptions() {
    chrome.storage.sync.get({
        seanimeUrl: 'http://127.0.0.1',
        seanimePort: '43211'
    }, (result) => {
        document.querySelector('#seanimeUrl').value = result.seanimeUrl;
        document.querySelector('#seanimePort').value = result.seanimePort;
        updatePreview();
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
document.querySelector('#seanimeUrl').addEventListener('input', updatePreview);
document.querySelector('#seanimePort').addEventListener('input', updatePreview);
