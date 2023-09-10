const API_GATEWAY_ENDPOINT = "https://ofyiu4huw6naoudaq4o4bq5ney0jykkq.lambda-url.ap-northeast-1.on.aws/";

document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const selectedDate = document.getElementById("selectedDate").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const selectedSite = document.getElementById("selectedSite").value;
    const numberInput = document.getElementById("numberInput").value;
    const cameraInput = document.getElementById("cameraInput");
    const previewImage = document.getElementById("previewImage");

    let fileKey = null;

    if (cameraInput.files && cameraInput.files[0]) {
        let reader = new FileReader();

        reader.onload = async function (e) {
            previewImage.src = e.target.result;
            fileKey = await uploadToKintone(cameraInput.files[0]);
        }

        reader.readAsDataURL(cameraInput.files[0]);
    }

    let previewText = `
        日付: ${selectedDate}<br>
        業務開始時間: ${startTime}<br>
        業務終了時間: ${endTime}<br>
        現場名: ${selectedSite}<br>
        作業区分: ${numberInput}<br>
    `;

    document.getElementById("previewContent").innerHTML = previewText;

    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();

    document.getElementById("confirmSubmit").addEventListener("click", function () {
        postToKintone({
            selectedDate, startTime, endTime, selectedSite, numberInput, fileKey
        });
    });
});

async function uploadToKintone(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "upload");

    const response = await fetch(API_GATEWAY_ENDPOINT, {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    return result.fileKey;
}

function postToKintone(data) {
    const { selectedDate, startTime, endTime, selectedSite, numberInput, fileKey } = data;

    const kintoneData = {
        action: "post",
        data: {
            app: 70,
            record: {
                "selectedDate": { "value": selectedDate },
                "startTime": { "value": startTime },
                "endTime": { "value": endTime },
                "selectedSite": { "type": "CHECK_BOX", "value": [selectedSite] },
                "cameraInput": { "type": "FILE", "value": [{ "fileKey": fileKey }] },
                "numberInput": { "value": numberInput }
            }
        }
    };

    fetch(API_GATEWAY_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(kintoneData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const previewModal = bootstrap.Modal.getInstance(document.getElementById('previewModal'));
        previewModal.hide();
    });
}