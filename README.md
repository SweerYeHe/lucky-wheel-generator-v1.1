<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fIANZ4TS_MJlqqVxfAATD7ZoZTC5_V9b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

创建一个抽奖页面，可以设置奖品和概率，初始奖品配置如下奖品初始配置：
神秘礼物1/40、
羽毛球一小时1/40、
玩一局三角洲1/40、
三角洲知识课(课件) 1/40、
手工课(20分钟) 1/20、
音乐课(20分钟) 1/20、
绘画课(20分钟) 1/20、
体操课(20分钟) 1/20、
进阶扩展课(20分钟) 2/20、
聊天课(20分钟) 2/20、
一个草稿本 2/20、
一个拥抱 3/20、
一次击掌 3/20）

……
Constructing Raffle Framework
I'm currently focused on the foundational structure using React, TypeScript, and Tailwind CSS. Setting up the basic layout and ensuring initial configuration matches the "Mystery Gift" prize is my immediate priority. I'm aiming for a responsive design with a clean, intuitive interface.
Calculating Probabilities
I've just finished the probability calculations for the raffle items, verifying the denominators and calculating each item's weight. The sum totals are now confirmed. I am transitioning to how these probabilities impact the user interface and how the "Mystery Gift" will be presented on the frontend.
Analyzing Probability Discrepancies
I've hit a snag: the initial probability sum is 0.9, not 1.0. This presents a key design choice: should "No Prize" be explicitly included or do I normalize the weights? I'm leaning toward normalization, as users expect a prize. I'm also considering the implications of a weight-based system for the backend logic and the front end display, especially concerning user experience. I will need to verify this logic on the front-end to ensure that the weights make sense visually.
Structuring Spin Logic
I'm currently structuring the core components of the raffle. I've defined components for Settings, Results, and prizes, along with the data types. I've decided to use standard CSS transitions for the wheel animation, avoiding external dependencies. The logic for wheel spinning based on prize weights, using isSpinning and rotation in the state, is now the central focus. I'm verifying the file structure as it evolves with these new component additions.
Mapping File Structure
I'm currently mapping the file structure to the evolving component requirements. I've focused on index.tsx, App.tsx, types.ts, and constants.ts to reflect the main structure of the raffle. The initial components have been decided: Wheel.tsx, Settings.tsx, and Modal.tsx. I've assessed the need for metadata.json, and considered the user's focus on setting prizes and probabilities, as well as considering adding the AI integration feature.
Incorporating AI Features
I'm now integrating AI-driven prize suggestions into the settings. Users will input themes, and the Gemini API will generate prize ideas with associated weights. I'm focusing on user-friendliness in this setup, ensuring the interface is intuitive. I'm considering using lucide-react for icons to enhance the user experience. I'm also planning the Prize type definition to include id, name, weight, and color.
Verifying Prize Weight
I've decided to incorporate canvas-confetti after reviewing the prompt. I'm checking for the Gemini API key and refining the data to precisely reflect the user's input, including the calculated weights. I'm focusing on the correct probability. This means ensuring an accurate calculation of shares and that total share weight is 36.
Determining Probability Handling
I'm now clarifying the probabilities and how they'll be handled in the raffle. Since the sum of current probabilities is 0.9, I will handle them as weights to determine each item's share. This is standard and ensures the "missing" 0.1 is distributed among the items. I am also considering a responsive design for the wheel, to make the user interface clearer.
Organizing Component Structure
I'm now integrating the Chinese translations for the prize names and considering the impact on the user interface. I'm focusing on making the raffle UI in Chinese and adding features based on the prompt. Specifically, I'm integrating the PrizeList.tsx component, the ai.ts service for the Gemini integration, and the canvas-confetti effect. I will put PrizeList inside Settings.tsx to reduce file count.
Mapping Directory Structure
I'm now focusing on setting up the directory structure as it closely relates to the components and services. I'm verifying the initial structure by adding a new metadata.json, and adjusting index.html to integrate the CDN script for canvas-confetti. I will add types for this global integration into index.tsx, along with the structure for index.tsx, App.tsx, types.ts, and constants.ts. I've added a structure for the wheel and added the AI Service as a service folder to integrate the Gemini AI feature. I am going to make the key available.
Calculating Spin Angle
I've been working on the wheel drawing logic, specifically drawing arcs based on weight. I am now focusing on spin logic, determining the winning segment based on RNG before the spin. I'll calculate the angle needed to land the winner under the pointer, adding random full rotations for a visually appealing animation. I'll refine the pointer position to ensure the winner is clearly indicated.
Constructing XML Structure
I'm now focusing on XML output. I've successfully calculated the winning angle for the wheel spin, considering initial offset and extra rotations for visual appeal. I've verified the angle calculation. Now, I'm working to structure the results into XML. I'm focusing on elements for prize name, weight, and win status, ensuring the output is valid. I'll test XML generation with different outcomes.
metadata.json
index.html
index.tsx
types.ts
constants.ts
services/geminiService.ts
components/Wheel.tsx
components/Settings.tsx
App.tsx

添加喜庆的音效，添加中奖记录页面，优化转盘效果确保最终指针指向中奖的区域
提供方案：
更新应用，主要包含以下改动：
新增音效系统：
转动音效：利用 Web Audio API 实现了转盘转动时的“咔哒”声，声音会随着转速变化，且只有在指针经过扇区边界时触发，更加真实。
中奖音效：中奖时会播放一段欢快的 C 大调琶音。
新增中奖记录页面：
点击右上角的时钟图标可打开记录页面。
记录会保存在本地浏览器中，刷新页面不会丢失。
支持一键清空记录。
优化转盘逻辑与动画：
重写了转动算法，确保指针在停止时能精准指向中奖扇区的中心位置，消除了视觉上的偏差。
调整了动画曲线（使用 Quintic Ease-Out），使减速过程更加丝滑自然。
美化了指针样式，使其更具立体感。

请执行这一方案
………
To fulfill your request, I will update the application to include sound effects, a history page, and optimized wheel animation.
Here is the plan:
Create utils/audio.ts: A utility to generate sound effects (ticking and winning music) using the Web Audio API without needing external files.
Create components/History.tsx: A new component to display the list of past winners with persistence.
Update components/Wheel.tsx: Rewrite the spinning logic to use a smoother easing function (Quintic), ensure precise alignment of the pointer to the center of the winning prize, and trigger sound effects as the wheel spins.
Update App.tsx: Integrate the History component, manage the history state (saving to local storage), and add a button to access it.
Here are the changes:
utils/audio.ts
components/History.tsx
components/Wheel.tsx
App.tsx

我希望将转盘用于不同的抽奖场景，比如我希望能够保存当前的这个场景的转盘配置命名为“学生奖励转盘”用于给学生抽奖时使用，我还可以创建一个新的转盘配置命名为“午餐吃什么转盘”用于抽取午餐吃什么，我可以在需要使用某个场景的转盘时切换到对应的转盘
……
这是一个非常实用的功能需求。为了实现多场景（多转盘配置）切换，我们需要对数据结构进行升级，引入“场景（Scenario）”的概念，并将数据持久化保存到本地。
以下是具体的修改方案：
修改数据结构 (types.ts)：增加 WheelScenario 接口。
更新常量 (constants.ts)：提供默认的“学生奖励”和“午餐”预设。
升级设置页面 (Settings.tsx)：在顶部增加场景切换、新建、重命名和删除的功能。
升级主程序 (App.tsx)：管理多场景状态，并将其保存到 localStorage。
以下是代码变更：
types.ts
constants.ts
components/Settings.tsx
App.tsx
