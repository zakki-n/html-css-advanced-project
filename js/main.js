// 共通: フォームバリデーション
(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    if (forms.length > 0) {
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }
                    form.classList.add('was-validated')
                }, false)
            })
    }
})();

// グローバル変数 (pet-guide-form.html用)
let selectedFiles = [];
let tags = [];

document.addEventListener('DOMContentLoaded', function() {
    // pet-guide-form.html: 気分選択の動作
    const moodOptions = document.querySelectorAll('.mood-option');
    if (moodOptions.length > 0) {
        moodOptions.forEach(option => {
            option.addEventListener('click', function () {
                moodOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // デモ用初期化 (pet-guide-form.html)
        const normalMood = document.querySelector('.mood-option[data-mood="normal"]');
        if (normalMood) {
            setTimeout(() => {
                normalMood.classList.add('active');
                setToday();
            }, 2000);
        }
    }

    // pet-guide-qa.html: 参考になったボタン
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    if (helpfulBtns.length > 0) {
        helpfulBtns.forEach(button => {
            button.addEventListener('click', function () {
                if (this.innerHTML.includes('参考になった')) {
                    this.innerHTML = '<i class="bi bi-hand-thumbs-up-fill"></i> 参考になりました';
                    this.style.background = 'var(--primary-color)';
                    this.style.color = 'white';
                } else {
                    this.innerHTML = '<i class="bi bi-hand-thumbs-up"></i> 参考になった';
                    this.style.background = 'transparent';
                    this.style.color = 'var(--primary-color)';
                }
            });
        });
    }

    // pet-guide-record.html: フィルターボタン
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(button => {
            button.addEventListener('click', function () {
                filterBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // pet-guide-form.html: ドラッグ&ドロップ機能
    const uploadArea = document.querySelector('.file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#e5e7eb';
            uploadArea.style.background = '#fafafa';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#e5e7eb';
            uploadArea.style.background = '#fafafa';

            const files = e.dataTransfer.files;
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.files = files;
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        });
    }

    // pet-guide-form.html: 初期化
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.value.trim();
                if (value) {
                    addTag(value);
                    this.value = '';
                }
            }
        });
    }

    // pet-guide-form.html: フォーム送信
    const recordForm = document.getElementById('recordForm');
    if (recordForm) {
        recordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // バリデーション
            const form = e.target;
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showToast('errorToast');
                return;
            }

            // 成功トースト表示
            showToast('successToast');

            // フォームリセット（オプション）
            setTimeout(() => {
                form.reset();
                tags = [];
                selectedFiles = [];
                const previewContainer = document.getElementById('imagePreviewContainer');
                if (previewContainer) previewContainer.innerHTML = '';
                
                const tagContainer = document.getElementById('tagContainer');
                if (tagContainer) tagContainer.innerHTML = '<input type="text" class="tag-input-field" id="tagInput" placeholder="タグを入力してEnter">';
                
                document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('active'));
                const normalMood = document.querySelector('.mood-option[data-mood="normal"]');
                if (normalMood) normalMood.classList.add('active');
                setToday();
            }, 2000);
        });
    }
    
    // ページ読み込み時に今日の日時を設定
    setToday();
});

// pet-guide-form.html: 今日の日付をセット
function setToday() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    const recordDateInput = document.getElementById('recordDate');
    if (recordDateInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
        recordDateInput.value = dateTimeString;
    }
}

// pet-guide-form.html: 下書き保存
function saveDraft() {
    showToast('draftToast');
}

// pet-guide-form.html: Toast表示関数
function showToast(toastId) {
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        toast.show();
    }
}

// pet-guide-form.html: 画像プレビュー
function previewImages(event) {
    const files = Array.from(event.target.files);
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;

    files.forEach((file, index) => {
        if (selectedFiles.length >= 10) {
            alert('最大10枚まで選択できます');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('ファイルサイズは5MB以下にしてください');
            return;
        }

        selectedFiles.push(file);
        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="プレビュー">
                <button class="remove-btn" onclick="removeImage(${selectedFiles.length - 1})">
                    <i class="bi bi-x"></i>
                </button>
            `;
            container.appendChild(preview);
        };

        reader.readAsDataURL(file);
    });
}

// pet-guide-form.html: 画像削除
function removeImage(index) {
    selectedFiles.splice(index, 1);
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;
    
    container.innerHTML = '';

    selectedFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="プレビュー">
                <button class="remove-btn" onclick="removeImage(${idx})">
                    <i class="bi bi-x"></i>
                </button>
            `;
            container.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
}

// pet-guide-form.html: タグ追加
function addTag(tagText) {
    if (!tagText || tagText.trim() === '') return;

    if (tags.includes(tagText)) {
        alert('このタグは既に追加されています');
        return;
    }

    if (tags.length >= 10) {
        alert('タグは最大10個まで追加できます');
        return;
    }

    tags.push(tagText);
    renderTags();
}

// pet-guide-form.html: タグ削除
function removeTag(index) {
    tags.splice(index, 1);
    renderTags();
}

// pet-guide-form.html: タグ描画
function renderTags() {
    const container = document.getElementById('tagContainer');
    const input = document.getElementById('tagInput');
    if (!container || !input) return;

    container.innerHTML = '';

    tags.forEach((tag, index) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            <span>${tag}</span>
            <span class="remove-tag" onclick="removeTag(${index})">×</span>
        `;
        container.appendChild(tagElement);
    });

    const newInput = input.cloneNode(true);
    container.appendChild(newInput);

    newInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = this.value.trim();
            if (value) {
                addTag(value);
                this.value = '';
            }
        }
    });
}
