document.addEventListener("DOMContentLoaded", async () => { //确保HTML结构加载完毕后执行js代码
    const taskList = document.querySelector(".task-list"); //获取tasklist的标签
    const closebtn = document.querySelector(".close-btn");

    // 加载数据库任务
    async function fetchTasks() { //异步函数
        const tasks = await window.databaseAPI.getTasks(); // 从数据库获取任务
        taskList.innerHTML = ""; // 清空列表并重新渲染
        tasks.forEach(task => addTaskToDOM(task));
    }

    // 事件委托：点击任务的小圆圈，标记任务
    taskList.addEventListener("click", async (event) => {
        if (event.target.classList.contains("circle")) { //classList是操作class属性的API
            const li = event.target.parentElement;
            event.target.classList.toggle("checked"); //切换类 从circle变为circle checked
            li.classList.toggle("marked");
        }
    });

    closebtn.addEventListener("click",()=>{
        window.close();
    })

    // 添加任务到 UI
    function addTaskToDOM(task) {
        const li = document.createElement("li"); //创建一个新的li
        li.setAttribute("data-id", task.id); //<li data-id="1">
        li.innerHTML = `<span class="circle" data-id="${task.id}"></span> ${task.text}`; //在其中包裹HTML内容
        taskList.appendChild(li);
    }

    // 添加新任务（同步数据库）
    window.addTask = async function () {
        const taskList = document.querySelector(".task-list");

        // 创建新任务的 `<li>`
        const newLi = document.createElement("li");
        newLi.innerHTML = `<span class="circle"></span> <input type="text" class="task-input" placeholder="输入任务..." autofocus>`;
        taskList.appendChild(newLi);

        // 获取输入框
        const inputField = newLi.querySelector(".task-input");
        inputField.focus(); // 自动聚焦

        // 标记任务未保存，防止重复提交
        newLi.dataset.saved = ""; //相当于<li data-saved=""></li>

        // 监听 `Enter` 键保存任务
        inputField.addEventListener("keypress", async (event) => {
            if (event.key === "Enter") {
                await saveTask(inputField, newLi);
            }
        });

        // 监听失去焦点（点击空白处也会保存）
        inputField.addEventListener("blur", async () => {
            await saveTask(inputField, newLi);
        });

        async function saveTask(inputField, li) {
            if (li.dataset.saved) return; // 避免重复保存
            li.dataset.saved = "true"; // 标记任务已保存

            const taskText = inputField.value.trim();
            if (taskText === "") {
                li.remove(); // 如果用户没有输入，则删除空白任务
                return;
            }

            const task = await window.databaseAPI.addTask(taskText); // 存入数据库
            li.setAttribute("data-id", task.id);
            li.innerHTML = `<span class="circle" data-id="${task.id}"></span> ${task.text}`;
        }
    };

    // 监听空白区域删除任务（删除数据库数据）
    document.addEventListener("click", async (event) => {
        if (!event.target.closest(".task-list")) {
            document.querySelectorAll(".marked").forEach(async task => {
                const taskId = task.getAttribute("data-id");
                if (taskId) {
                    await window.databaseAPI.deleteTask(taskId); // 从数据库删除
                    task.remove();
                }
            });
        }
    });

    fetchTasks(); // 加载任务
});

