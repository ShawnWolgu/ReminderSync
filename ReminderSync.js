// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: list;
// Print reminders that are due for today to a file.

const key = "secret_";
const tasks_id = "";
const proj_id = "";
const json_template = {"Tomatos":{"id":"vIaw","type":"number","number":0},"Name":{"id":"title","type":"title","title":[{"annotations":{"code":false,"bold":false,"underline":false,"italic":false,"strikethrough":false,"color":"default"},"plain_text":" ","type":"text","href":null,"text":{"content":" ","link":null}}]},"Date":{"id":"%60D%3E%7B","type":"date","date":{"start":null,"end":null,"time_zone":null}},"Project":{"has_more":false,"id":"u%3D_%3D","relation":[],"type":"relation"},"Finish":{"id":"%40m%3Db","type":"checkbox","checkbox":true}};

class task{
  constructor(reminder, proj=[], notion=false){
    this.notion = notion;
    this.update = false;
    this.pair = false;
    if (notion == false){
      this.id = 'icloud'; 
      this.name = reminder.title;
      this.project = reminder.calendar.title;
      if (reminder.notes != null) this.tomatos = reminder.notes.length/2;
      else this.tomatos = 0;
      if (reminder.dueDate != null) this.date = dateFormatter.string(reminder.dueDate);
      else this.date = null;
      this.date_start = this.date;
      this.date_end = null;
      this.finish = reminder.isCompleted;
      this.json = JSON.parse(JSON.stringify(json_template));
      };

    if (notion == true){
      this.id = reminder["id"];
      let props = reminder["properties"];
      this.json = props;
      this.name = props["Name"]["title"][0]["text"]["content"];
      this.project = null;
      if (props["Project"]["relation"].length != 0) this.project = get_project_name(props["Project"]["relation"][0]["id"],proj);
      this.tomatos = props["Tomatos"]["number"];
      this.date = props["Date"]["date"];
      this.finish = props["Finish"]["checkbox"];
      if (this.date != null){
	this.date_start = this.date["start"]
        this.date_end = this.date["end"]
	this.date = this.date_start;
      }
    }
  }
  
  initialize_json_icloud(proj){
    this.json["Name"]["title"][0]["text"]["content"] = this.name;
    if (this.project != null) {
	var pro = get_project_id(this.project, proj);
	if (pro != null) this.json["Project"]["relation"] = [{"id": get_project_id(this.project, proj)}];
    }
    this.json["Tomatos"]["number"] = this.tomatos;
    if (this.date != null) this.json["Date"]["date"]["start"] = this.date_start;
    this.json["Date"]["date"]["end"] = this.date_end;
    this.json["Finish"]["checkbox"] = this.finish;
  }

  update_json(){
    this.json["Name"]["title"][0]["text"]["content"] = this.name;
    this.json["Tomatos"]["number"] = this.tomatos;
    if (this.date != null) this.json["Date"]["date"]["start"] = this.date;
    this.json["Date"]["date"]["end"] = this.date_end;
    this.json["Finish"]["checkbox"] = this.finish;
  }

  async push_to_notion(){
    const create_url = "https://api.notion.com/v1/pages";
    const payload = {"parent": {"database_id": tasks_id}, "properties": this.json};
    const db = new Request(create_url)
    db.method = "POST"
    db.headers = {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      "Authorization": "Bearer " +key
    };
    db.body = JSON.stringify(payload);
    var response = await db.loadJSON();
    return response["results"];
  }

  async update_to_notion(){
    if (this.update = false) return 0;
    const url = "https://api.notion.com/v1/pages/"
    const payload = {"properties": this.json}
    const db = new Request(url+this.id)
    db.method = "PATCH"
    db.headers = {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      "Authorization": "Bearer " +key
    };
    db.body = JSON.stringify(payload);
    var response = await db.loadJSON();
    return response["results"];
  }

  async delete_in_notion(){
    const url = "https://api.notion.com/v1/pages/"
    const payload = {"archived": true}
    const db = new Request(url+this.id)
    db.method = "PATCH"
    db.headers = {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      "Authorization": "Bearer " +key
    };
    db.body = JSON.stringify(payload);
    var response = await db.loadJSON();
    return response["results"];
  }

  async push_to_reminder(){
    if (this.project == null){
      if(this.date == null) this.project = 'Inbox';
      else this.project = '@Context';
    }
    let parentCalendar = await Calendar.findOrCreateForReminders(this.project);
    let newReminder = new Reminder();
    newReminder.title = this.name
    newReminder.calendar = parentCalendar;
    newReminder.dueDate = dateIcloud.date(this.date+" 21:00");
    newReminder.notes = tomatoStr(this.tomatos);
    newReminder.isCompleted = this.finish;
    newReminder.save();
    return 0;
  }

  async update_to_reminder(){
    if (this.update == false) return 0;
    let parentCalendar = await Calendar.findOrCreateForReminders(this.project);
    let remindersInCal = await Reminder.all([parentCalendar])
    let iter = 0
    while (iter < remindersInCal.length){
      let iReminder = remindersInCal[iter];
      ++iter;
      if (iReminder.title == this.name){
	if (this.date == null) iReminder.dueDate == null;
        else iReminder.dueDate = dateIcloud.date(this.date + " 21:00");
        iReminder.notes = tomatoStr(this.tomatos);
        iReminder.isCompleted = this.finish;
        iReminder.save()
	return 0;
        }
      continue
    }
    return 1;
  }
  
  async delete_in_reminder(){
    this.finish = true;
    this.update_to_reminder()
    return 0;
  }

  isConsistent(secTask){
    if(this.name != secTask.name) return false;
    if(this.project == secTask.project) return true;
    if((this.notion == true)&&(this.project == null)){
      if (isProject(secTask.project,['Inbox', '@Context'])) return true;
      else return false;
    }
    if((this.notion == false)&&(isProject(this.project,['Inbox', '@Context']))){
      if (secTask.project == null) return true;
      else return false;
    }
    return false;
  }

  jsonString() {
    let str = JSON.stringify(this.json);
    return str;
  }
}

//functions:
function iCloudTasks(reminders,proj) {
  // Add reminders to the table.
  task_list = [];
  for (reminder of reminders) {
    let itask = new task(reminder);
    itask.initialize_json_icloud(proj);
    task_list.push(itask);
  }
  return task_list;
}

async function get_pages(dbID){
  const url = "https://api.notion.com/V1/databases/";
  const db = new Request(url+dbID+"/query")
  db.method = "POST"
  db.headers = {
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
    "Authorization": "Bearer " +key
  };
  var response = await db.loadJSON();
  return response["results"];
};

function get_project_name(page_id, proj){
    let projLen = proj.length;
    let iter = 0;
    while (iter < projLen){
        if (page_id == proj[iter]["id"]){
            return proj[iter]["properties"]["项目"]["title"][0]["plain_text"];
	}
	++iter;
    }
    return null;
};

function get_project_id(page_name,proj){
    let projLen = proj.length;
    let iter = 0;
    while (iter < projLen){
        if (page_name == proj[iter]["properties"]["项目"]["title"][0]["plain_text"]){
            return proj[iter]["id"];
	}
	++iter;
    }
    return null;
}

function get_notion_tasks(pages, proj){
    task_list = [];
    let ind = 0;
    while (ind < pages.length){
        task_list.push(new task(pages[ind],proj,true))
	++ind;
    };
    return task_list;
};

function tomatoStr(number) {
  let str = "";
  let iter = 0;
  while (iter < number){
    str += "🍅";
    ++ iter;
  }
  return str;
}

function isProject(project, projectList){
  let iter = 0;
  let length = projectList.length;
  while (iter < length) {
    if (project == projectList[iter]) return true;
    else ++iter;
    continue;
  }
  return false;
}

function updateTasks(task1, task2){
//task1 from iCloud, task2 from Notion
  task1.pair = true;
  task2.pair = true;
  if (task1.tomatos != task2.tomatos){
    task1.tomatos = task2.tomatos;
    task1.update = true;
  }
  if (task1.date != task2.date){
    if (task2.date == null) {
      task1.date = task2.date;
      task1.update = true;
    }
    else {task1.date = task2.date;
    task1.update = true;}
  }
  if (task1.finish != task2.finish){
    if (task1.finish == false) {
      task1.finish = true;
      task1.update = true;
    }
    else {
      task2.finish = true;
      task2.update = true;
    }
  }
  if (task2.update) task2.update_json();
}

//Main Program
let dateFormatter = new DateFormatter();
dateFormatter.dateFormat="yyyy-MM-dd";
let dateIcloud = new DateFormatter();
dateIcloud.dateFormat="yyyy-MM-dd HH:mm";
//let output = FileManager.iCloud();
//let path = output.joinPath(output.documentsDirectory(),'remindersInfo.json');

//Collect Notion tasks:
let notionPages = await get_pages(tasks_id);
let notionProjs = await get_pages(proj_id);
let notionTaskList = await get_notion_tasks(notionPages, notionProjs)
//Collect iCloud Reminder tasks:
let calCateg = await Calendar.forReminders();
let icloudPages = await Reminder.all(calCateg);
let icloudTaskList = iCloudTasks(icloudPages,notionProjs);
//Compare iCloud tasks and Notion tasks:
let icloudIter = 0;
while (icloudIter < icloudTaskList.length){
  let icloudTask = icloudTaskList[icloudIter];
  ++icloudIter;
  if (isProject(icloudTask.project,["Someday / Maybe","Waiting for", "Daily / Weekly"])) continue;
  let notionIter = 0;
  while (notionIter < notionTaskList.length){
    let notionTask = notionTaskList[notionIter];
    ++notionIter;
    if(icloudTask.isConsistent(notionTask)){
      updateTasks(icloudTask, notionTask);
      icloudTask.update_to_reminder();
      notionTask.update_to_notion();
      break;
    }
  }
  if ((!icloudTask.finish)&&(!icloudTask.pair)) icloudTask.push_to_notion();
}
let notionIter = 0;
while (notionIter < notionTaskList.length){
  let notionTask = notionTaskList[notionIter];
  ++notionIter;
  if (notionTask.pair == true) continue;
  if (notionTask.finish == true) continue;
  notionTask.push_to_reminder();
}
Speech.speak('Finish Task Sync!')
