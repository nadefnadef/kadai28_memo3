document.addEventListener("DOMContentLoaded", function () {
    const toggleFormButton = document.querySelector(".toggle-form-button");
    const formContainer = document.querySelector(".form-container");
    const form = document.getElementById("emergencyForm");
    const submitBtn = document.getElementById("submitBtn");
    const clearBtn = document.getElementById("clearBtn");
    const incidentType = document.getElementById("incidentType");
    const rescueDetails = document.getElementById("rescueDetails");
    const peopleCount = document.getElementById("peopleCount");
    const unknownPeople = document.getElementById("unknownPeople");
    const openMapBtn = document.getElementById("openMapBtn");
    const mapModal = document.getElementById("mapModal");
    const closeBtn = document.querySelector(".close");
    const mapLinkInput = document.getElementById("mapLink");
    const addressInput = document.getElementById("address");
    let selectedLocation = null;

    // ページ読み込み時にフォームのデータをlocalStorageから復元
    loadFormData();
    loadPosts();

    // フォームの表示・非表示の切り替え
    toggleFormButton.addEventListener("click", () => {
        const isFormVisible = formContainer.style.display === "block";
        formContainer.style.display = isFormVisible ? "none" : "block";
        toggleFormButton.textContent = isFormVisible ? "新規被害について投稿する" : "投稿をキャンセル";
    });

    // 入力内容を確認して、送信ボタンを有効化
    form.addEventListener("input", () => {
        let isValid = form.checkValidity();
        submitBtn.disabled = !isValid;
        submitBtn.classList.toggle("disabled", !isValid);
        saveFormData(); // 入力があるたびにフォームデータを保存
    });

    // "要救助者あり"が選択された場合、追加の入力項目を表示
    incidentType.addEventListener("change", () => {
        if (incidentType.value === "要救助者あり") {
            rescueDetails.style.display = "block";
            peopleCount.required = true;
        } else {
            rescueDetails.style.display = "none";
            peopleCount.required = false;
        }
        saveFormData(); // 選択に応じてフォームデータを保存
    });

    // 人数不明チェックボックスが選択された場合、人数入力を無効化
    unknownPeople.addEventListener("change", () => {
        peopleCount.disabled = unknownPeople.checked;
        if (unknownPeople.checked) {
            peopleCount.value = "";
        }
        saveFormData(); // チェックボックスの選択に応じてフォームデータを保存
    });

    // Google Mapsの表示
    openMapBtn.addEventListener("click", () => {
        const area = document.getElementById("area").value;
        const address = addressInput.value;
        const searchQuery = encodeURIComponent(area + " " + address);
        const googleMapUrl = `https://www.google.com/maps/search/?q=${searchQuery}`;
        window.open(googleMapUrl, '_blank');
    });

    // モーダルを閉じる
    closeBtn.addEventListener("click", () => {
        mapModal.style.display = "none";
    });

    // フォームの送信
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        savePost();
        clearForm();
        formContainer.style.display = "none";
        toggleFormButton.textContent = "新規被害について投稿する";
    });

    // フォームのリセット
    clearBtn.addEventListener("click", () => {
        clearForm();
        saveFormData(); // フォームをクリアしたらデータを保存
    });

    // フォームのデータをlocalStorageに保存
    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        localStorage.setItem("formData", JSON.stringify(data));
    }

    // フォームのデータをlocalStorageから読み込み
    function loadFormData() {
        const data = localStorage.getItem("formData");
        if (data) {
            const formData = JSON.parse(data);
            Object.keys(formData).forEach((key) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = formData[key];
                }
            });
        }
    }

    // 投稿のデータをlocalStorageに保存
    function savePost() {
        const formData = new FormData(form);
        const post = {};
        formData.forEach((value, key) => {
            post[key] = value;
        });

        // 写真データをlocalStorageに保存（base64エンコード）
        const photoInput = document.getElementById("photo");
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            post.photo = reader.result;
            const posts = JSON.parse(localStorage.getItem("posts")) || [];
            posts.push(post);
            localStorage.setItem("posts", JSON.stringify(posts));
            addPostToTable(post);
        };
        reader.readAsDataURL(file);
    }

    // 投稿のデータをlocalStorageから読み込み
    function loadPosts() {
        const posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.forEach(post => {
            addPostToTable(post);
        });
    }

    // 投稿をテーブルに追加
    function addPostToTable(post) {
        const tableBody = document.querySelector("#postsTable tbody");
        const row = document.createElement("tr");

        Object.keys(post).forEach(key => {
            const cell = document.createElement("td");
            if (key === "photo") {
                const img = document.createElement("img");
                img.src = post[key];
                img.width = 100;
                cell.appendChild(img);
            } else if (key === "mapLink" && post[key]) {
                const a = document.createElement("a");
                a.href = post[key];
                a.target = "_blank";
                a.textContent = "地図を見る";
                cell.appendChild(a);
            } else {
                cell.textContent = post[key];
            }
            row.appendChild(cell);
        });

        // 削除ボタンを追加
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.addEventListener("click", () => {
            tableBody.removeChild(row);
            deletePost(post);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    }

    // 投稿を削除
    function deletePost(postToDelete) {
        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts = posts.filter(post => post !== postToDelete);
        localStorage.setItem("posts", JSON.stringify(posts));
    }

    // フォームのクリア
    function clearForm() {
        form.reset();
        rescueDetails.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.classList.add("disabled");
    }
});

