(function () {
    const MAX_DIM = 50;
    const form = document.querySelector('form');
    const img = <HTMLImageElement>document.querySelector('img');
    const input = <HTMLInputElement>document.getElementById('avatar');
    const progress = <HTMLElement>document.querySelector('.progress');
    let file: File;

    if (!form) {
        console.log('Danger! No form :(');
        return;
    } else if (!img) {
        console.log('Danger! No image :(');
        return;
    } else if (!input) {
        console.log('Danger! No input :(');
        return;
    }

    form.addEventListener('submit', onSubmit, false);
    input.addEventListener('change', onChange, false);

    function onChange(ev: Event) {
        if (!input.files) {
            console.log('Danger! No input files :(');
            return;
        } else if (!FileReader) {
            console.log('Danger! No FileReader :(');
            return;
        }

        file = input.files[0];

        const reader = new FileReader();

        reader.onload = (readerEvent) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return;
                }

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                let resizedImage = dataUrlToFile(canvas.toDataURL('image/jpeg'), `resized-${file.name}`);

                if (!resizedImage || resizedImage.size <= 0 || resizedImage.size >= file.size) {
                    return;
                }

                file = resizedImage;
            };

            img.src = <string>readerEvent.target?.result;
        };

        reader.onerror = () => {
            console.log('FileReader Error :(');
        };

        reader.readAsDataURL(file);
    }

    function dataUrlToFile(data: string, filename: string) {
        if (!Uint8Array || !File || !data) {
            return;
        } else if (data.indexOf(';base64,') === -1) {
            const parts = data.split(',');
            const contentType = parts[0].split(':')[1];
            const raw = parts[1];

            return new File([raw], filename, { type: contentType });
        }

        const parts = data.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new File([uInt8Array], filename, { type: contentType });
    }

    function onSubmit(ev: Event) {
        ev.preventDefault();

        if (!FormData) {
            alert('Image upload not supported');
            return;
        } else if (!file) {
            if (!input.files) {
                console.log('Danger! No input files :(');
                return;
            }

            file = input.files[0];
        }

        if (!file) {
            console.log('Danger! No file found :(');
            return;
        }

        const xhr = new XMLHttpRequest();

        if (!!progress) {
            xhr.upload.addEventListener('progress', (ev) => {
                if (!ev.lengthComputable) {
                    progress.textContent = '';
                    return;
                }

                const percent = ev.loaded / ev.total;
                progress.textContent = `${Math.round(percent * 100)}%`;
            }, false);
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304) {
                    const res = JSON.parse(xhr.response);

                    if (!res) {
                        alert('No file upload response');
                        return;
                    }

                    const url = res.url;
                    img.src = url;
                    img.classList.remove('hidden');
                } else {
                    alert('File upload failed');
                }
            }
        };

        const payload = new FormData();

        payload.append('avatar', file);

        xhr.open('POST', '/api/v1/users/avatar', true);
        xhr.send(payload);
    }
})();