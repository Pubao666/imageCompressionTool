let originalFile = null;
let compressedFile = null;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const qualitySlider = document.getElementById('quality');
    const downloadBtn = document.getElementById('downloadBtn');

    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    // 文件选择上传
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // 质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        document.getElementById('qualityValue').textContent = `${e.target.value}%`;
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 下载按钮
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = `compressed_${originalFile.name}`;
            link.click();
        }
    });
});

// 处理图片上传
async function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    originalFile = file;
    document.querySelector('.compression-controls').style.display = 'block';
    document.querySelector('.preview-container').style.display = 'grid';

    // 显示原图预览
    displayImage(file, 'originalPreview');
    document.getElementById('originalSize').textContent = formatFileSize(file.size);

    // 压缩图片
    await compressImage(file, document.getElementById('quality').value / 100);
}

// 压缩图片
async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        const compressedBlob = await imageCompression(file, options);
        compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type
        });

        // 显示压缩后预览
        displayImage(compressedFile, 'compressedPreview');
        document.getElementById('compressedSize').textContent = formatFileSize(compressedFile.size);
        document.getElementById('downloadBtn').disabled = false;

    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 显示图片预览
function displayImage(file, elementId) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById(elementId).src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 