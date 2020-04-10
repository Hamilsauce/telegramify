// *TODO this could be placed in it's own module as it only relies on url input from external source
let records = [];
let htmlArray = [];
let messages = [];
let htmlOut = '';

const url = `https://hamilsauce.github.io/telegramify/data/tg-data-export.json`; //${apiKey}
const apocNowId = 8816899683;
const funchatId = 8979731584;

const toggleClass = (el, className) => el.classList.toggle(className);


//! list builder
const lister = list => {
  let listArr = list.map(item => {
      return `<li class="listItem" id="${item}">${item}</li>`
    })
    .reduce((itemOut, acc) => {
      return acc += itemOut;
    }, '');
  console.log(listArr);
  return listArr;
};
//! end list builder

//! general purpose/reusable functions
const validateName = name => {
  return name.trim() ? true : false;
};

const showData = data => {
  let objData = Object.entries(data);
  console.log(objData);
};

const htmlListOut = list => {
  let dataDisplay = document.querySelector('#divContents');
  dataDisplay.innerHTML = `<ul class="list">${list}</ul>`;
};
//!end resuable stuff

const limitMsgs = messageList => { //* will return unique list of names
  console.log('messageList');
  console.log(messageList);
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
    return msgByName;
  }
};

const generateMsgCard = propStrings => {
  let reducedString = propStrings
    .reduce((acc, string) => {
      return acc += string;
    }, '');
  let newCard = document.createElement('div');
  newCard.innerHTML = reducedString;
  newCard.setAttribute('class', 'message-card');
  document.querySelector('.data-display').appendChild(newCard);
}

const writeMsgCard = msgList => {
  let reduced = '';
  let dateTextFrom = [];

  //get data for each objs display card, create html string
  msgList.forEach(msg => {
    for (let [prop, val] of Object.entries(msg)) {
      if (prop === 'date') {
        let msgDate = new Date(val).toDateString();
        dateTextFrom[0] = `<div class="card-date">${msgDate}</div>`;
      } else if (prop === 'text') {
        //todo need to check if array eventualy
        dateTextFrom[1] = `<div class="card-body">${val}</div>`;
      } else if (prop === 'from') {
        dateTextFrom[2] = `<div class="card-author">${val}</div>`;
      }
    }
    generateMsgCard(dateTextFrom);
  });
}

//! Listens for the request submit button to run query and return some results
document.querySelector('.getDataButton').addEventListener('click', e => {
  e.preventDefault();
  request({
      url: url
    })
    .then(data => { //! chat name is acquired here. heeds to refresh every time the selectio changes
      let chatData = JSON.parse(data);
      let chatList = chatData.chats.list;
      console.log(chatList);
      let chatNameQuery = document.querySelector('.chatInput').value;

      let targetChatId = chatNameQuery === 'Apocalypse Now' ? apocNowId : funchatId;

      let chatTarget = chatList.find(chat => {
        return chat.id == targetChatId;
      });

      messages = chatTarget.messages
        .filter(msg => {
          return msg.type === 'message';
        });

    });

  //! generats minor anaylsis of msg stats for queried name, preps  it for vewing, pushes it to dom
  const displayTotal = document.querySelector('.display-header1');
  const displayPerc = document.querySelector('.display-header2');
  const nameInput = document.querySelector('.name-input').value;

  let resultMsgs = filterMessagesByName(nameInput);
  let percent = Math.round(((resultMsgs.length / messages.length) * 100));

  document.querySelector('.data-display').innerHTML = '';
  writeMsgCard(limitMsgs(resultMsgs));

  displayTotal.innerText = `${resultMsgs.length} messages`;
  displayPerc.innerText = `${percent}% of all`;

});

document.querySelector('.saveButton').addEventListener('click', e => {
  saveDataToFile();
});

//*Collapse the form for more space
document.querySelector('.collapse').addEventListener('click', (e) => {
  const userform = document.querySelector('.userform');
  const container = document.querySelector('.top-container');

  if (userform.style.height === '0px') {
    userform.style.height = '100%';
  } else {
    userform.style.height = '0px';

  }
});

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

const tallies = (msgArray) => {
  let totalMsgs = msgArray.length;

  let jakeMsgs = messages.filter(msgArray => {
    return msg.from_id == 523989469
  });
  console.log('jakeMsgs.length');
  console.log(jakeMsgs.length);

}
