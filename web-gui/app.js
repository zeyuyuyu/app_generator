// Base44 应用生成器 - 前端逻辑
class Base44GUI {
    constructor() {
        this.socket = null;
        this.templates = [];
        this.init();
    }

    init() {
        console.log('🚀 Base44 GUI 初始化...');
        this.initSocket();
        this.loadTemplates();
        this.bindEvents();
        this.showWelcomeAnimation();
    }

    // 初始化Socket连接
    initSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ Socket连接成功:', this.socket.id);
        });

        this.socket.on('progress', (data) => {
            this.updateProgress(data);
        });

        this.socket.on('error', (data) => {
            this.showError(data.message);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket连接断开');
        });
    }

    // 加载应用模板
    async loadTemplates() {
        try {
            const response = await fetch('/api/templates');
            this.templates = await response.json();
            this.renderTemplates();
        } catch (error) {
            console.error('加载模板失败:', error);
        }
    }

    // 渲染模板列表
    renderTemplates() {
        const templatesContainer = document.getElementById('templates');
        
        this.templates.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-card bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300';
            templateElement.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <i class="fas fa-cube text-purple-500 text-lg"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-800 mb-1">${template.name}</h3>
                        <p class="text-sm text-gray-600 mb-2">${template.description}</p>
                        <button class="text-xs text-purple-600 hover:text-purple-800 font-medium">
                            <i class="fas fa-arrow-right mr-1"></i>使用模板
                        </button>
                    </div>
                </div>
            `;

            templateElement.addEventListener('click', () => {
                this.useTemplate(template);
            });

            templatesContainer.appendChild(templateElement);
        });
    }

    // 使用模板
    useTemplate(template) {
        const promptInput = document.getElementById('promptInput');
        const appNameInput = document.getElementById('appNameInput');
        
        promptInput.value = template.prompt;
        appNameInput.value = template.id + '-app';
        
        // 添加视觉反馈
        promptInput.classList.add('ring-2', 'ring-purple-300');
        setTimeout(() => {
            promptInput.classList.remove('ring-2', 'ring-purple-300');
        }, 2000);

        this.showNotification(`已选择模板：${template.name}`, 'success');
    }

    // 绑定事件
    bindEvents() {
        const generateForm = document.getElementById('generateForm');
        generateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGenerate();
        });

        // 自动生成应用名称
        const promptInput = document.getElementById('promptInput');
        const appNameInput = document.getElementById('appNameInput');
        
        promptInput.addEventListener('input', () => {
            if (!appNameInput.value) {
                const appName = this.generateAppName(promptInput.value);
                appNameInput.value = appName;
            }
        });
    }

    // 生成应用名称
    generateAppName(prompt) {
        const keywords = prompt.match(/[\u4e00-\u9fff]+|[a-zA-Z]+/g) || [];
        if (keywords.length > 0) {
            return keywords.slice(0, 2).join('-').toLowerCase() + '-app';
        }
        return 'my-app';
    }

    // 处理生成请求
    async handleGenerate() {
        const promptInput = document.getElementById('promptInput');
        const appNameInput = document.getElementById('appNameInput');
        const schemaInput = document.getElementById('schemaInput');
        const portInput = document.getElementById('portInput');

        const prompt = promptInput.value.trim();
        const appName = appNameInput.value.trim();

        if (!prompt) {
            this.showNotification('请输入应用需求描述', 'error');
            return;
        }

        if (!appName) {
            this.showNotification('请输入应用名称', 'error');
            return;
        }

        // 显示进度界面
        this.showProgressSection();
        this.hideSuccessSection();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Socket-ID': this.socket.id
                },
                body: JSON.stringify({
                    prompt: prompt,
                    outputName: appName,
                    options: {
                        schema: schemaInput.value || 'public',
                        port: parseInt(portInput.value) || 8000
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result.outputPath);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('生成失败:', error);
            this.showError('网络请求失败，请检查服务器连接');
        }
    }

    // 显示进度界面
    showProgressSection() {
        const progressSection = document.getElementById('progressSection');
        const generateBtn = document.getElementById('generateBtn');
        
        progressSection.classList.remove('hidden');
        progressSection.classList.add('fade-in');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        
        // 清空之前的日志
        document.getElementById('progressLogs').innerHTML = '';
    }

    // 隐藏进度界面
    hideProgressSection() {
        const progressSection = document.getElementById('progressSection');
        const generateBtn = document.getElementById('generateBtn');
        
        progressSection.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-rocket mr-2"></i>开始生成应用';
    }

    // 显示成功界面
    showSuccessSection() {
        const successSection = document.getElementById('successSection');
        successSection.classList.remove('hidden');
        successSection.classList.add('fade-in');
    }

    // 隐藏成功界面
    hideSuccessSection() {
        const successSection = document.getElementById('successSection');
        successSection.classList.add('hidden');
    }

    // 更新进度
    updateProgress(data) {
        const { step, message, progress } = data;
        
        // 更新进度条
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = message;
        progressPercent.textContent = `${progress}%`;

        // 添加日志
        this.addProgressLog(step, message);

        // 如果完成，显示成功界面
        if (progress >= 100) {
            setTimeout(() => {
                this.hideProgressSection();
            }, 1000);
        }
    }

    // 添加进度日志
    addProgressLog(step, message) {
        const progressLogs = document.getElementById('progressLogs');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'mb-2 text-gray-700';
        logEntry.innerHTML = `
            <span class="text-gray-500">${timestamp}</span> 
            <span class="font-medium text-blue-600">[${step.toUpperCase()}]</span> 
            ${message}
        `;
        
        progressLogs.appendChild(logEntry);
        progressLogs.scrollTop = progressLogs.scrollHeight;
    }

    // 显示成功结果
    showSuccess(outputPath) {
        document.getElementById('outputPath').textContent = outputPath;
        this.showSuccessSection();
        this.showNotification('应用生成成功！', 'success');
    }

    // 显示错误
    showError(message) {
        this.hideProgressSection();
        this.showNotification(`生成失败: ${message}`, 'error');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 欢迎动画
    showWelcomeAnimation() {
        // 可以添加一些欢迎动画效果
        console.log('🎉 欢迎使用 Base44 应用生成器！');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new Base44GUI();
}); 