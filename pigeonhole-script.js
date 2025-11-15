// 全局变量
let currentProblem = null;
let currentDifficulty = null;

// DOM元素
let elements = {};

// 初始化
function init() {
    setupElements();
    setupEventListeners();
    disableButtons();
}

// 设置DOM元素引用
function setupElements() {
    elements = {
        difficultyButtons: document.querySelectorAll('.difficulty-btn'),
        newProblemButton: document.getElementById('new-problem'),
        problemDisplay: document.getElementById('problem-display'),
        answerInput: document.getElementById('answer'),
        submitButton: document.getElementById('submit-answer'),
        resultFeedback: document.getElementById('result-feedback'),
        explanationContent: document.getElementById('explanation-content')
    };
}

// 设置事件监听器
function setupEventListeners() {
    // 难度选择按钮
    if (elements.difficultyButtons) {
        elements.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                selectDifficulty(button.dataset.level);
            });
        });
    }

    // 生成新题目按钮
    if (elements.newProblemButton) {
        elements.newProblemButton.addEventListener('click', generateNewProblem);
    }

    // 提交答案按钮
    if (elements.submitButton) {
        elements.submitButton.addEventListener('click', submitAnswer);
    }

    // 回车键提交答案
    if (elements.answerInput) {
        elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitAnswer();
            }
        });
    }
}

// 选择难度
function selectDifficulty(level) {
    // 移除所有按钮的活动状态
    if (elements.difficultyButtons) {
        elements.difficultyButtons.forEach(button => {
            button.classList.remove('active');
        });

        // 添加选中按钮的活动状态
        const selectedButton = document.querySelector(`.difficulty-btn[data-level="${level}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    }

    currentDifficulty = level;
    enableButtons();

    // 清空当前题目和答案
    resetProblem();
}

// 启用按钮
function enableButtons() {
    if (elements.newProblemButton) {
        elements.newProblemButton.disabled = false;
    }
}

// 禁用按钮
function disableButtons() {
    if (elements.newProblemButton) {
        elements.newProblemButton.disabled = true;
    }
    if (elements.submitButton) {
        elements.submitButton.disabled = true;
    }
}

// 重置问题
function resetProblem() {
    currentProblem = null;
    if (elements.problemDisplay) {
        elements.problemDisplay.textContent = '请点击"生成新题目"按钮';
    }
    if (elements.answerInput) {
        elements.answerInput.value = '';
    }
    if (elements.resultFeedback) {
        elements.resultFeedback.textContent = '';
        elements.resultFeedback.className = 'feedback';
    }
    if (elements.explanationContent) {
        elements.explanationContent.innerHTML = '<p>请先提交你的答案，这里将显示详细的解题思路和步骤。</p>';
    }
    if (elements.submitButton) {
        elements.submitButton.disabled = true;
    }
}

// 根据难度生成题目
function generateNewProblem() {
    if (!currentDifficulty) return;

    let problem;
    
    switch (currentDifficulty) {
        case 'easy':
            problem = generateEasyProblem();
            break;
        case 'medium':
            problem = generateMediumProblem();
            break;
        case 'hard':
            problem = generateHardProblem();
            break;
        default:
            problem = generateEasyProblem();
    }

    currentProblem = problem;
    displayProblem(problem);
    if (elements.submitButton) {
        elements.submitButton.disabled = false;
    }
    if (elements.answerInput) {
        elements.answerInput.focus();
    }
}

// 生成简单难度题目（基础鸽巢问题）
function generateEasyProblem() {
    // 简单难度：直接应用鸽巢原理的基本形式
    const nestTypes = [
        { nestName: '鸽巢', itemName: '鸽子', itemEmoji: '🐦' },
        { nestName: '抽屉', itemName: '物品', itemEmoji: '📦' },
        { nestName: '盒子', itemName: '球', itemEmoji: '🎲' },
        { nestName: '篮子', itemName: '苹果', itemEmoji: '🍎' },
        { nestName: '班级', itemName: '学生', itemEmoji: '👨‍🎓' }
    ];
    
    const type = nestTypes[Math.floor(Math.random() * nestTypes.length)];
    const nestCount = Math.floor(Math.random() * 5) + 2; // 2-6个鸽巢
    const itemCount = nestCount + Math.floor(Math.random() * 3) + 1; // 比鸽巢多1-3个物品
    
    const minItemsPerNest = Math.ceil(itemCount / nestCount);
    
    return {
        type,
        nestCount,
        itemCount,
        answer: minItemsPerNest,
        type: 'basic',
        // 修复这里：直接使用itemCount和nestCount变量，而不是type.itemCount和type.nestCount
        question: `有${itemCount}${type.itemEmoji}放进${nestCount}个${type.nestName}里，至少有一个${type.nestName}里有多少个${type.itemName}？`,
        explanation: generateBasicExplanation(type, nestCount, itemCount, minItemsPerNest)
    };
}

// 生成中等难度题目（颜色、生日等应用问题）
function generateMediumProblem() {
    const problemTypes = [
        generateColorProblem(),
        generateBirthdayProblem(),
        generateCardProblem(),
        generateHandshakeProblem()
    ];
    
    return problemTypes[Math.floor(Math.random() * problemTypes.length)];
}

// 生成困难难度题目（复杂应用或多个鸽巢原理的组合）
function generateHardProblem() {
    const problemTypes = [
        generateComplexColorProblem(),
        generateMultiNestProblem(),
        generateIntervalProblem(),
        generateWordProblem()
    ];
    
    return problemTypes[Math.floor(Math.random() * problemTypes.length)];
}

// 颜色问题（中等难度）
function generateColorProblem() {
    const colors = ['红色', '蓝色', '绿色', '黄色', '紫色'];
    const colorCount = Math.floor(Math.random() * 3) + 3; // 3-5种颜色
    const selectedColors = colors.slice(0, colorCount);
    const guaranteePairs = Math.floor(Math.random() * 3) + 2; // 2-4对
    const answer = colorCount * (guaranteePairs - 1) + 1;
    
    return {
        type: 'color',
        colors: selectedColors.join('、'),
        guaranteePairs,
        answer,
        question: `盒子里有${selectedColors.join('、')}的球各若干个。至少要摸出多少个球，才能保证有${guaranteePairs}个颜色相同的球？`,
        explanation: generateColorExplanation(selectedColors, guaranteePairs, answer)
    };
}

// 生日问题（中等难度）
function generateBirthdayProblem() {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                        '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    const monthIndex = Math.floor(Math.random() * 12);
    const daysInMonth = monthDays[monthIndex];
    const monthName = monthNames[monthIndex];
    const guaranteeSameDay = Math.floor(Math.random() * 2) + 2; // 2-3人同一天生日
    const answer = daysInMonth * (guaranteeSameDay - 1) + 1;
    
    return {
        type: 'birthday',
        month: monthName,
        days: daysInMonth,
        guaranteeSameDay,
        answer,
        question: `某班有若干学生，他们都在${monthName}出生。至少有多少个学生，才能保证至少有${guaranteeSameDay}个学生在同一天生日？`,
        explanation: generateBirthdayExplanation(monthName, daysInMonth, guaranteeSameDay, answer)
    };
}

// 扑克牌问题（中等难度）
function generateCardProblem() {
    const suits = ['黑桃', '红心', '梅花', '方块'];
    const faceCards = ['J', 'Q', 'K', 'A'];
    
    const guaranteeFaceCards = Math.floor(Math.random() * 3) + 2; // 2-4张
    const answer = 36 + guaranteeFaceCards; // 52-16=36张非花牌 + 需要的花牌数量
    
    return {
        type: 'card',
        guaranteeFaceCards,
        answer,
        question: `一副扑克牌（去掉大小王后共52张），至少要抽出多少张牌，才能保证有${guaranteeFaceCards}张是J、Q、K或A？`,
        explanation: generateCardExplanation(guaranteeFaceCards, answer)
    };
}

// 握手问题（中等难度）
function generateHandshakeProblem() {
    const peopleCount = Math.floor(Math.random() * 5) + 5; // 5-9人
    // 对于握手问题，根据鸽巢原理，正确答案应该是2
    const answer = 2;
    
    return {
        type: 'handshake',
        peopleCount,
        answer,
        question: `有${peopleCount}个人参加聚会，每两个人之间可以握手一次。至少有多少个人，他们握手的次数相同？`,
        explanation: generateHandshakeExplanation(peopleCount, answer)
    };
}

// 复杂颜色问题（困难难度）
function generateComplexColorProblem() {
    const colors = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色'];
    const colorCount = Math.floor(Math.random() * 2) + 4; // 4-5种颜色
    const selectedColors = colors.slice(0, colorCount);
    const ballsPerColor = Math.floor(Math.random() * 3) + 3; // 每种颜色3-5个球
    const guaranteeDifferentColors = Math.floor(Math.random() * 2) + 3; // 3-4种不同颜色
    const answer = (ballsPerColor * (guaranteeDifferentColors - 1)) + 1;
    
    return {
        type: 'complex-color',
        colors: selectedColors.join('、'),
        ballsPerColor,
        guaranteeDifferentColors,
        answer,
        question: `盒子里有${selectedColors.join('、')}的球各${ballsPerColor}个。至少要摸出多少个球，才能保证有${guaranteeDifferentColors}个不同颜色的球？`,
        explanation: generateComplexColorExplanation(selectedColors, ballsPerColor, guaranteeDifferentColors, answer)
    };
}

// 多个鸽巢问题（困难难度）
function generateMultiNestProblem() {
    const itemTypes = [
        { name: '铅笔', emoji: '✏️' },
        { name: '橡皮', emoji: '🧽' },
        { name: '尺子', emoji: '📏' },
        { name: '笔记本', emoji: '📓' }
    ];
    
    const typeCount = Math.floor(Math.random() * 2) + 3; // 3-4种文具
    const selectedTypes = itemTypes.slice(0, typeCount);
    const students = Math.floor(Math.random() * 10) + 10; // 10-19个学生
    const answer = Math.ceil(students / typeCount);
    
    return {
        type: 'multi-nest',
        itemTypes: selectedTypes,
        students,
        answer,
        question: `教室里有${students}个学生，老师要把${selectedTypes.map(t => t.name).join('、')}分给大家，每人只能拿一种文具。至少有多少个学生拿到的文具类型相同？`,
        explanation: generateMultiNestExplanation(selectedTypes, students, answer)
    };
}

// 区间问题（困难难度）
function generateIntervalProblem() {
    const numberRange = Math.floor(Math.random() * 50) + 50; // 50-99
    const numbersToChoose = Math.floor(Math.random() * 10) + 11; // 11-20个数字
    
    return {
        type: 'interval',
        numberRange,
        numbersToChoose,
        // 对于这种问题，正确答案是2（至少有2个数的差是9）
        answer: 2,
        question: `从1到${numberRange}中任意选出${numbersToChoose}个不同的数，至少有多少个数的差是9？`,
        explanation: generateIntervalExplanation(numberRange, numbersToChoose)
    };
}

// 单词问题（困难难度）
function generateWordProblem() {
    const wordLength = Math.floor(Math.random() * 2) + 3; // 3-4个字母
    const wordsToWrite = Math.floor(Math.random() * 10) + 27; // 27-36个单词
    const answer = Math.ceil(wordsToWrite / 26);
    
    return {
        type: 'word',
        wordLength,
        wordsToWrite,
        answer,
        question: `小明写了${wordsToWrite}个由${wordLength}个英文字母组成的单词，这些单词的首字母都是大写字母（A-Z）。至少有多少个单词的首字母相同？`,
        explanation: generateWordExplanation(wordLength, wordsToWrite, answer)
    };
}

// 显示题目
function displayProblem(problem) {
    if (elements.problemDisplay) {
        elements.problemDisplay.textContent = problem.question;
    }
    if (elements.answerInput) {
        elements.answerInput.value = '';
    }
    if (elements.resultFeedback) {
        elements.resultFeedback.textContent = '';
        elements.resultFeedback.className = 'feedback';
    }
    if (elements.explanationContent) {
        elements.explanationContent.innerHTML = '<p>请先提交你的答案，这里将显示详细的解题思路和步骤。</p>';
    }
}

// 提交答案
function submitAnswer() {
    if (!currentProblem) return;

    // 区间问题现在需要用户输入数字答案2
    if (currentProblem.type === 'interval') {
        // 针对区间问题的特殊提示
        const userAnswer = parseInt(elements.answerInput?.value);
        const isCorrect = (userAnswer === currentProblem.answer);
        
        if (isNaN(userAnswer) || userAnswer < 0) {
            showFeedback('请输入有效的非负数字', 'incorrect');
            return;
        }
        
        if (isCorrect) {
            showFeedback('恭喜你！答案正确！至少有2个数的差是9。', 'correct');
        } else {
            showFeedback(`答案不正确。正确答案是${currentProblem.answer}，请再试一次。`, 'incorrect');
        }
        
        showExplanation(currentProblem.explanation);
        return;
    }

    const userAnswer = parseInt(elements.answerInput?.value);
    
    // 验证输入
    if (isNaN(userAnswer) || userAnswer < 0) {
        showFeedback('请输入有效的非负数字', 'incorrect');
        return;
    }
    
    // 检查答案是否正确
    const isCorrect = (userAnswer === currentProblem.answer);
    
    if (isCorrect) {
        showFeedback('恭喜你！答案正确！', 'correct');
    } else {
        showFeedback(`答案不正确。正确答案是${currentProblem.answer}，请再试一次。`, 'incorrect');
    }
    
    // 显示解题思路
    showExplanation(currentProblem.explanation);
}

// 显示反馈信息
function showFeedback(message, type) {
    if (elements.resultFeedback) {
        elements.resultFeedback.textContent = message;
        elements.resultFeedback.className = `feedback ${type}`;
    }
}

// 显示解题思路
function showExplanation(explanation) {
    if (elements.explanationContent) {
        elements.explanationContent.innerHTML = explanation;
    }
}

// 生成基础鸽巢原理解题思路
function generateBasicExplanation(type, nestCount, itemCount, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>这是一个典型的鸽巢原理问题，我们需要找到至少有一个${type.nestName}中最少有多少个${type.itemName}。</li>
                <li>根据鸽巢原理：如果有n个鸽子放进m个鸽巢，那么至少有一个鸽巢里有至少⌈n/m⌉个鸽子（⌈⌉表示向上取整）。</li>
                <li>在这个问题中，我们有${itemCount}${type.itemEmoji}（鸽子）和${nestCount}个${type.nestName}（鸽巢）。</li>
                <li>计算：${itemCount} ÷ ${nestCount} = ${Math.floor(itemCount / nestCount)} 余 ${itemCount % nestCount}</li>
                <li>因为有余数，所以至少有一个${type.nestName}里有 ${Math.floor(itemCount / nestCount) + 1} 个${type.itemName}。</li>
                <li>因此，答案是${answer}。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成颜色问题解题思路
function generateColorExplanation(colors, guaranteePairs, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>我们需要考虑最坏情况：摸出的球尽可能多，但还没达到${guaranteePairs}个颜色相同的球。</li>
                <li>最坏情况下，我们会摸出每种颜色各${guaranteePairs - 1}个球。</li>
                <li>这里有${colors.length}种颜色，所以最多可以摸出 ${colors.length} × ${guaranteePairs - 1} = ${colors.length * (guaranteePairs - 1)} 个球而没有${guaranteePairs}个相同颜色的球。</li>
                <li>再摸出1个球，无论这个球是什么颜色，都会使得该颜色的球达到${guaranteePairs}个。</li>
                <li>因此，至少需要摸出 ${colors.length * (guaranteePairs - 1) + 1} = ${answer} 个球。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成生日问题解题思路
function generateBirthdayExplanation(month, days, guaranteeSameDay, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>我们需要考虑最坏情况：尽可能多的学生，但还没有${guaranteeSameDay}个学生在同一天生日。</li>
                <li>${month}有${days}天，最坏情况下，我们可以安排${guaranteeSameDay - 1}个学生在每一天出生。</li>
                <li>这样最多可以安排 ${days} × ${guaranteeSameDay - 1} = ${days * (guaranteeSameDay - 1)} 个学生而没有${guaranteeSameDay}个学生在同一天生日。</li>
                <li>再增加1个学生，无论这个学生在哪一天出生，都会使得那一天有${guaranteeSameDay}个学生过生日。</li>
                <li>因此，至少需要 ${days * (guaranteeSameDay - 1) + 1} = ${answer} 个学生。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成扑克牌问题解题思路
function generateCardExplanation(guaranteeFaceCards, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>我们需要考虑最坏情况：尽可能多地抽牌，但还没有${guaranteeFaceCards}张J、Q、K或A。</li>
                <li>一副扑克牌（去掉大小王）有52张牌，其中J、Q、K、A各4张，共16张花牌。</li>
                <li>非花牌有 52 - 16 = 36 张。</li>
                <li>最坏情况下，我们先抽完所有36张非花牌，然后再抽${guaranteeFaceCards - 1}张花牌。</li>
                <li>此时我们已经抽了 36 + ${guaranteeFaceCards - 1} = ${36 + guaranteeFaceCards - 1} 张牌，但还没有${guaranteeFaceCards}张花牌。</li>
                <li>再抽1张牌，这张牌一定是花牌，这样我们就有${guaranteeFaceCards}张花牌了。</li>
                <li>因此，至少需要抽 36 + ${guaranteeFaceCards} = ${answer} 张牌。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成握手问题解题思路
function generateHandshakeExplanation(peopleCount, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>在${peopleCount}个人中，每个人最多可以和其他${peopleCount - 1}个人握手，最少可以和0个人握手。</li>
                <li>但是，如果有一个人握手次数为0（即不和任何人握手），那么就不可能有人握手次数为${peopleCount - 1}（即和所有人握手）。</li>
                <li>因此，可能的握手次数要么是0到${peopleCount - 2}，要么是1到${peopleCount - 1}，共有${peopleCount - 1}种可能的握手次数。</li>
                <li>根据鸽巢原理，有${peopleCount}个人，但只有${peopleCount - 1}种可能的握手次数，所以至少有两个人握手次数相同。</li>
                <li>更准确地说，至少有⌈${peopleCount} / (${peopleCount - 1})⌉ = ${answer}个人握手次数相同。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成复杂颜色问题解题思路
function generateComplexColorExplanation(colors, ballsPerColor, guaranteeDifferentColors, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>我们需要考虑最坏情况：摸出的球尽可能多，但还没达到${guaranteeDifferentColors}种不同颜色。</li>
                <li>最坏情况下，我们会摸出某几种颜色的所有球，而不摸其他颜色。</li>
                <li>为了保证有${guaranteeDifferentColors}种不同颜色，我们需要考虑最多能摸出多少个球而不包含${guaranteeDifferentColors}种颜色。</li>
                <li>最多可以摸出${guaranteeDifferentColors - 1}种颜色的所有球，每种颜色有${ballsPerColor}个，所以最多可以摸出 ${ballsPerColor} × (${guaranteeDifferentColors - 1}) = ${ballsPerColor * (guaranteeDifferentColors - 1)} 个球而只有${guaranteeDifferentColors - 1}种颜色。</li>
                <li>再摸出1个球，无论这个球是什么颜色，都会使得我们拥有${guaranteeDifferentColors}种不同颜色的球。</li>
                <li>因此，至少需要摸出 ${ballsPerColor * (guaranteeDifferentColors - 1) + 1} = ${answer} 个球。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成多个鸽巢问题解题思路
function generateMultiNestExplanation(itemTypes, students, answer) {
    const typeCount = itemTypes.length;
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>这是一个应用鸽巢原理的问题，其中学生是"鸽子"，文具类型是"鸽巢"。</li>
                <li>我们有${students}个学生（鸽子）和${typeCount}种文具（鸽巢）。</li>
                <li>根据鸽巢原理，如果有n个鸽子放进m个鸽巢，那么至少有一个鸽巢里有至少⌈n/m⌉个鸽子。</li>
                <li>计算：${students} ÷ ${typeCount} = ${Math.floor(students / typeCount)} 余 ${students % typeCount}</li>
                <li>因为有余数，所以至少有一种文具会被至少 ${Math.floor(students / typeCount) + 1} 个学生选择。</li>
                <li>因此，至少有${answer}个学生拿到的文具类型相同。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 生成区间问题解题思路
function generateIntervalExplanation(numberRange, numbersToChoose) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>我们可以将1到${numberRange}的数分成若干个"鸽巢"，每个鸽巢中的数相差为9。</li>
                <li>例如：{1, 10, 19, ...}, {2, 11, 20, ...}, {3, 12, 21, ...}, ..., {9, 18, 27, ...}</li>
                <li>这样的鸽巢共有9个（对应个位数字1-9）。</li>
                <li>根据鸽巢原理，如果我们从1到${numberRange}中选出${numbersToChoose}个数，那么至少有一个鸽巢中会有至少⌈${numbersToChoose}/9⌉个数。</li>
                <li>计算：${numbersToChoose} ÷ 9 = ${Math.floor(numbersToChoose / 9)} 余 ${numbersToChoose % 9}</li>
                <li>因为${numbersToChoose} > 9，所以至少有一个鸽巢中有至少2个数。</li>
                <li>而同一个鸽巢中的任意两个数的差都是9的倍数，所以至少有两个数的差是9。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：至少有2个数的差是9</strong></p>
        </div>
    `;
}

// 生成单词问题解题思路
function generateWordExplanation(wordLength, wordsToWrite, answer) {
    return `
        <div class="solution-steps">
            <h4>解题思路：</h4>
            <ol>
                <li>这是一个应用鸽巢原理的问题，其中单词是"鸽子"，英文字母A-Z是"鸽巢"。</li>
                <li>我们有${wordsToWrite}个单词（鸽子）和26个英文字母（鸽巢）。</li>
                <li>根据鸽巢原理，如果有n个鸽子放进m个鸽巢，那么至少有一个鸽巢里有至少⌈n/m⌉个鸽子。</li>
                <li>计算：${wordsToWrite} ÷ 26 = ${Math.floor(wordsToWrite / 26)} 余 ${wordsToWrite % 26}</li>
                <li>因为有余数，所以至少有一个字母会被用作至少 ${Math.floor(wordsToWrite / 26) + 1} 个单词的首字母。</li>
                <li>因此，至少有${answer}个单词的首字母相同。</li>
            </ol>
        </div>
        <div class="answer-summary">
            <p><strong>答案：${answer}</strong></p>
        </div>
    `;
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);