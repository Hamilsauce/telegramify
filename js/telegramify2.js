// *TODO this could be placed in it's own module as it only relies on url input from external source
let records = [];
let htmlArray = [];
let messages = [];

const dataStore = {};

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

    dataStore.filteredMsgs = msgByName;
    // sessionStorage.setItem('filteredMsgs', JSON.stringify(msgByName))
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

  document.querySelector('.data-display').innerHTML = '';
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

document.querySelector('.getDataButton').addEventListener('click', e => {
  e.preventDefault();
  const submitButton = document.querySelector('.getDataButton');
  let chatNameQuery = document.querySelector('.chatInput').value;
  submitButton.value = 'one second...';

  request({
      url: url
    })
    .then(data => {
      let chatData = JSON.parse(data); //update UI
      let chatList = chatData.chats.list;

      submitButton.value = 'Get messages';
      renderUI();

      //start building
      let targetChatId = chatNameQuery === 'Apocalypse Now' ? apocNowId : funchatId;
      let chatTarget = chatList.find(chat => {
        return chat.id == targetChatId;
      });
      messages = chatTarget.messages.filter(msg => {
        return msg.type === 'message';
      });
    }).catch(err => {
      console.log(err)
      submitButton.value = 'Get messages';
    });
});

document.querySelector('.saveButton').addEventListener('click', e => {
  saveDataToFile();
});

const dateFilter = msgs => {
  const dateInput = document.querySelector('.date-input');
  //  2019-04-05T16:41:16
  let dateValue = new Date(dateInput.value).toDateString();
  console.log(dateValue);


  let filteredDates = msgs
    .filter(msg => {

      let msgDate = new Date(msg.date).toDateString();
      // console.log(msgDate);
      return msgDate == dateValue

    })
  console.log(filteredDates);

  return filteredDates;
};

document.querySelector('.date-input').addEventListener('change', e => {

  console.log('filtering by date')
  // const filteredMsgs = JSON.parse(sessionStorage.getItem('filteredMsgs')) || {};
  const nameFilteredMsgs = dataStore.filteredMsgs
  // let resultMsgs = filterMessagesByName(nameInput);

  let dateFiltered = dateFilter(nameFilteredMsgs);
  const displayTotal = document.querySelector('.display-header1');
  const displayPerc = document.querySelector('.display-header2');
  const nameInput = document.querySelector('.name-input').value;

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




// const tallies = (msgArray) => {
//   let totalMsgs = msgArray.length;

//   let jakeMsgs = messages.filter(msgArray => {
//     return msg.from_id == 523989469
//   });
//   console.log('jakeMsgs.length');
//   console.log(jakeMsgs.length);

// }