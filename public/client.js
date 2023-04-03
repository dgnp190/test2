
const socket = io();

const user = {};

const messageContainer = document.getElementById("message_container");
const roomIdInput = document.getElementById("roomIdInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessage");

joinRoomBtn.addEventListener('click', () => {
    let inputValue = roomIdInput.value;
    validateInput(inputValue);
});

roomIdInput.addEventListener('keypress', e => {
    if (e.charCode == 13) {
        let inputValue = roomIdInput.value;
        validateInput(inputValue);
    }
});

messageInput.addEventListener('keypress', e => {
    if (e.charCode == 13) {
        let inputMessage = messageInput.value;
        validateMessage(inputMessage);
    }
});

sendMessageBtn.addEventListener('click', () => {
    let inputMessage = messageInput.value;
    validateMessage(inputMessage);
});

// Listening socket events from server
socket.on('new_user_joined', name => {
    joinAlert(name);
});

socket.on('recieve_msg', data => {
    let sender = data.username;
    let sms = data.message;
    if (sender == user.username) {
        return;
    } else {
        recieveMsg(sender, sms);
    }
});

socket.on('return_usercount', data => {
    let message = `There are ${data.usersize} online users in the room. 
    [Only you can see this message]`;
    let requestedBy = data.requestedBy;
    if (requestedBy == user.username) {
        recieveMsg('Whisper Bot', message);
    }else {
        return;
    }
});

socket.on('user_left', () => {
    leaveAlert();
});

function validateInput(inputValue) {
    let trimmed_input = inputValue.trim();
    if (trimmed_input.length < 3 || trimmed_input.length > 10) {
        showError("Username must be higher than 4 charecters and lower than 11 charecters");
    } else {
        let username = trimmed_input;
        loadRoom(username);
    }
}

function validateMessage(msg) {
    let trimmed_message = msg.trim();
    if (trimmed_message < 2 || trimmed_message.length > 8000) {
        showError("Message is too big or too small");
    } else {
        sendMessage(msg);
        messageInput.value = "";
    }
}

function loadRoom(username) {
    const joinInterface = document.querySelector(".get_started_container");
    const roomInterface = document.querySelector(".room_container");
    joinInterface.classList.add("hidden");
    roomInterface.classList.remove("hidden");
    user.username = username;
    socket.emit('join_request', username);
}

function sendMessage(msg) {

    if (msg == "/info") {
        botReply('info');
    } else if (msg == "/usercount") {
        botReply('usercount');
    } else {
        const messageBox = document.createElement('div');
        messageBox.setAttribute('class', 'message_box');
        messageBox.classList.add("right");

        const nameLabel = document.createElement('span');
        nameLabel.innerText = user.username;

        const brk = document.createElement('br');

        const msgParagraph = document.createElement('p');
        msgParagraph.innerText = msg;

        messageBox.appendChild(nameLabel);
        messageBox.appendChild(brk);
        messageBox.appendChild(msgParagraph);

        messageContainer.appendChild(messageBox);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        socket.emit('send_msg', { message: msg, username: user.username });
    }
}

function botReply(cmd) {
    if (cmd == 'info') {
        let message = `This is a global chatting app developed by Rudro. You can learn more by clicking about us above.
        [Only you can see this message]`;
        recieveMsg('Whisper Bot', message);
    } else if (cmd == 'usercount') {
        socket.emit('get_usercount', user.username);
    }
}

function recieveMsg(who, what) {
    const messageBox = document.createElement('div');
    messageBox.setAttribute('class', 'message_box');

    const nameLabel = document.createElement('span');
    nameLabel.innerText = who;

    const brk = document.createElement('br');

    const msgParagraph = document.createElement('p');
    msgParagraph.innerText = what;

    messageBox.appendChild(nameLabel);
    messageBox.appendChild(brk);
    messageBox.appendChild(msgParagraph);

    messageContainer.appendChild(messageBox);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function joinAlert(name) {
    const alertBox = document.createElement('div');
    alertBox.setAttribute('class', 'alert_box');

    const nameSpan = document.createElement('span');
    nameSpan.innerText = name;

    const label = document.createElement('p');
    label.innerHTML = "&nbsp;joined the room";

    alertBox.appendChild(nameSpan);
    alertBox.appendChild(label);

    messageContainer.appendChild(alertBox);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function leaveAlert() {
    const alertBox = document.createElement('div');
    alertBox.setAttribute('class', 'alert_box');

    const nameSpan = document.createElement('span');
    nameSpan.innerText = 'A user';

    const label = document.createElement('p');
    label.innerHTML = "&nbsp;left the room";

    alertBox.appendChild(nameSpan);
    alertBox.appendChild(label);

    messageContainer.appendChild(alertBox);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showError(err) {
    alert(err);
}

