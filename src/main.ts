import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

window.addEventListener('load', setup);

async function fileToString(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsText(file);
    });
}

async function fileToBlob(file: File): Promise<Blob> {
    const reader = new FileReader();
    const promise = new Promise<Blob>(resolve => {
        reader.onloadend = () => {
            const data = reader.result as ArrayBuffer;
            const blob = new Blob([data], {type: file.type});
            resolve(blob);
        };
    });
    reader.readAsArrayBuffer(file);
    return promise;
}

async function exportZip(game: File, audio: FileList) {
    const name = game.name.replace(/\.html$/, "");
    const zip = JSZip();
    const folder = zip.folder(name)!;

    const lines = [];

    for (let i = 0; i < audio.length; ++i) {
        const path = audio[i].name;

        lines.push(`<audio id="${path}" src="${path}" autoplay loop></audio>`);
        folder.file(path, await fileToBlob(audio[i]));
    }

    const clickToPlay = `
<script>
function unmute() {
    ${Array.from(audio).map(file => `document.getElementById("${file.name}").play();`).join('\n')}
    document.removeEventListener('pointerup', unmute);
    document.removeEventListener('keydown', unmute);
}
document.addEventListener('pointerup', unmute);
document.addEventListener('keydown', unmute);
</script>`;

    const insert = `${lines.join("\n")} ${clickToPlay}</body>`;

    let html = await fileToString(game);
    html = html.replace("</body>", insert);

    folder.file("index.html", html);

    const content = await zip.generateAsync({type: "blob"});

    FileSaver.saveAs(content, `${name}.zip`);
}

function setup() {
    const htmlInput = document.getElementById("input-html") as HTMLInputElement;
    const audioInput = document.getElementById("input-audio") as HTMLInputElement;
    const exportButton = document.getElementById("export-zip") as HTMLButtonElement;

    exportButton.addEventListener('click', () => exportZip(htmlInput.files![0], audioInput.files!));
}
