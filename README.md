# ReminderSync
A synchronizer of Notion and Apple Reminder App based on Scriptable API

## Main Functions

When opening the reminder app, synchronize the to-do information and completion status between Notion and the reminder app.

### Synchronization Rules

1. Collect all tasks from Reminder and Notion, and put them in two separate arrays.
2. Traverse the Reminder tasks and judge:
    1. Tasks in lists like Maybe / Waiting for, Daily / Weekly, etc. will not be pushed.
    2. Whether there is a consistent task in Notion: If yes, judge the completion status and time and update it, taking the information on the Notion side as the main source.
    3. If not, completed tasks will not be pushed to Notion, and unfinished tasks will be synchronized (create a new Notion task).
3. Traverse the Notion tasks and judge:
    1. Whether there is a consistent task in Reminder: If yes, and it has been updated.
    2. If not, completed tasks will not be pushed to Reminder, and unfinished tasks will be synchronized (create a new Reminder task).
4. Synchronized content: time (day), tomato, and completion status.

## Usage

### App

Scriptable App

### Notion API Token and Page ID

Token "secret_XXX";
Reminder DB ID "XXX";
Project DB ID "XXX";

### iCloud Reminder Structure

Built according to GTD ideas, it includes the following Calendar (Reminder Container):

- Inbox: All unsorted to-do items
- @Context: To-do items without project affiliation
- ProjectXXX: To-do items belonging to a project
- Daily / Weekly, Waiting for, Someday / Maybe: No to-do synchronization involved

### Notion To-Do Database Structure

- Finish: checkbox, to judge whether it is completed
- Name: title, to-do item name
- Date: date, start and end date, only synchronize the start date
- Project: relation, link to the project title in the project database
- Tomatos: number, expected time consumption

### Notion Project Overview Database Structure

- Project: title, project name
- Other properties do not involve to-do synchronization

## 主要功能

在开启提醒事项app时同步Notion与提醒事项app中的待办事项信息与完成情况

### 同步规则

1. 收集Reminder和Notion的所有任务，分别放在两个array
2. 遍历Reminder任务，判断：
    1. Maybe / Waiting for、Daily / Weekly等列表的任务不会push
    2. Notion中是否存在一致的任务：存在，判断完成状态与时间并更新，以Notion侧信息为主
    3. 不存在：已完成的任务不会push到notion，同步未完成任务（新建notion task）
3. 遍历Notion任务，判断
    1. Reminder中是否存在一致的任务：存在，且已更新
    2. 不存在：已完成的任务不会push到Reminder，同步未完成任务（新建Reminder task）
4. 同步内容：时间（日）、番茄、是否完成

## 使用

### App

Scriptable App

### Notion API Token 与 页面ID

Token "secret_XXX";
提醒事项ID "XXX";
项目总览ID "XXX";

### iCloud Reminder 结构

按照GTD思路搭建，包含如下Calendar（Reminder Container）：

- Inbox：所有未整理的待办事项
- @Context：没有项目归属的待办事项
- ProjectXXX：属于某项目的待办事项
- Daily / Weekly， Waiting for，Someday / Maybe：不涉及待办同步

### Notion待办事项数据库结构

- Finish：checkbox，判断是否完成
- Name：title，待办事项名称
- Date：date，起止日期， 仅同步起始日期
- Project：relation，链接project数据库中项目title
- Tomatos：number，预期耗时

### Notion项目总览数据库结构

- 项目：title，项目名称
- 其他property不涉及待办同步
