// *TODO this could be placed in it's own module as it only relies on url input from external source
let messages = [];
//@util funcs
const dataStore = {};
const toggleClass = (el, className) => el.classList.toggle(className);
//@end util funcs

const url = `https://hamilsauce.github.io/telegramify/data/tg-data-export.json`; //${apiKey}
const apocNowId = 8816899683;
const funchatId = 8979731584;

const validateName = name => {
  return name.trim() ? true : false;
};

const limitMsgs = messageList => { //* will return unique list of names
  console.log('messageList');
  // console.log(messageList);
  let oneHundredLimit = messageList
    .filter(msg => {
      return messageList.indexOf(msg) < 100;
    });
  return oneHundredLimit;
};

let request = obj => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(obj.mthod || 'GET', obj.url, true);
    if (obj.headers) {
      Object.keys(obj.headers).forEach(key => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(obj.body);
  });
};

const filterMessagesByName = name => {
  const errorMessage = `Name entered isn't valid.`;
  if (validateName(name) === false) {
    return errorMessage;
  } else {
    let msgByName = messages
      .filter(msg => {
        return msg.from.trim().toUpperCase().indexOf(name.trim().toUpperCase()) >= 0;
      });
    dataStore.filteredMsgs = msgByName;
    return msgByName;
  }
};

const writeMsgCard = msgList => {
  let propsToDisplay = ['id', 'date', 'text', 'from'];

  document.querySelector('.data-display').innerHTML = ''; //empty existing messages displayed
  Object.values(msgList).forEach((msg, index) => { //@ get data for each objs display card, create html string
    let cardParts = Object.entries(msg)
      .filter(propName => {
        return propsToDisplay.includes(propName[0])
      })
      .map(([key, value]) => {
        if (key === 'id') return '';
        if (key === 'date') value = new Date(value).toLocaleDateString();
        if (typeof value == 'object') value = JSON.stringify(value, null, 2);
        return /*html*/ `<div class="card-${key}">${value}</div>`;
      })
      .reduce((acc, string) => {
        return acc += string;
      }, '');
    generateMsgCard(cardParts, msg.id);
  })
}

const generateMsgCard = (cardGuts, id) => { //* takes a string of html w/ card data, creates messagecard div, inserts string into div as inner html, appends to display html elem
  let newCard = document.createElement('div');
  newCard.classList.add('message-card');
  newCard.setAttribute('data-id', id)

  newCard.innerHTML = cardGuts;
  document.querySelector('.data-display').appendChild(newCard);
}

document.querySelector('.getDataButton').addEventListener('click', e => {
  e.preventDefault();
  const submitButton = document.querySelector('.getDataButton');
  let chatNameQuery = document.querySelector('.chatInput').value;
  submitButton.value = 'one second...';

  request({
      url: url
    })
    .then(data => {
      let chatData = JSON.parse(data);
      let chatList = chatData.chats.list;

      //map user selection to chat id, find the chat msg array
      let targetChatId = chatNameQuery === 'Apocalypse Now' ? apocNowId : funchatId;
      let chatTarget = chatList.find(chat => {
        return chat.id == targetChatId;
      });
      messages = chatTarget.messages.filter(msg => { //filter msgs for non-msg things (invitations, service posts)
        return msg.type === 'message';
      });
      renderUI();
      submitButton.value = 'Get messages';
    }).catch(err => {
      console.log(err)

    });
});

document.querySelector('.saveButton').addEventListener('click', e => {
  saveDataToFile();
});

const dateFilter = msgs => {
  const dateInput = document.querySelector('.date-input');
  let dateValue = new Date(dateInput.value).toDateString();
  let filteredDates = msgs
    .filter(msg => {
      let msgDate = new Date(msg.date).toDateString();
      return msgDate == dateValue
    })

  return filteredDates;
};

document.querySelector('.date-input').addEventListener('change', e => {
  const userDate = e.target.value;
  const nameFilteredMsgs = dataStore.filteredMsgs

  if (userDate === '') { //if date input gets cleared, don't filter by date and re render stored msgs
    writeMsgCard(nameFilteredMsgs);
    return;
  }
  let dateFiltered = dateFilter(nameFilteredMsgs);
  const displayDayTotal = document.querySelector('.display-header3');

  displayDayTotal.innerText = `${dateFiltered.length} this day`

  writeMsgCard(dateFiltered)
})

function saveDataToFile() {
  const nameInput = document.querySelector('.name-input').value;
  let resultMsgs = filterMessagesByName(nameInput)
  const blob = new Blob([JSON.stringify(resultMsgs, null, 2)]);
  let a = document.body.appendChild(document.createElement('a'));

  a.href = window.URL.createObjectURL(blob);
  a.download = 'telegram-messages' + '.txt';
  a.click();
  a = null;
}

const renderUI = () => {
  const displayTotal = document.querySelector('.display-header1');
  const displayPerc = document.querySelector('.display-header2');
  const nameInput = document.querySelector('.name-input').value;

  document.querySelector('.data-display').innerHTML = '';

  let resultMsgs = filterMessagesByName(nameInput);
  let percent = Math.round(((resultMsgs.length / messages.length) * 100));

  displayTotal.innerText = `${resultMsgs.length} messages`;
  displayPerc.innerText = `${percent}% of all`;

  writeMsgCard(limitMsgs(resultMsgs));
}

const collapseTop = () => {
  const top = document.querySelector('.userform')
  toggleClass(top, 'hide')
}