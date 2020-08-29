const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomList = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join to chat room
socket.emit('joinRoom', { username, room });

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Room Info
socket.on('roomUsers', ({ room, users }) => {
  console.log(users, room);
  outputRoomName(room);
  outputUsers(users);
});

// Message Submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // get message to the server
  socket.emit('chatMessage', msg);

  // Clear te input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function outputMessage(msg) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${msg.username} <span>${msg.time}</span></p>
  <p class="text">
    ${msg.text}
  </p>`;

  document.querySelector('.chat-messages').appendChild(div);
}

// Add Room Name to the dom
const outputRoomName = (room) => {
  roomList.innerText = room;
};

// Add Users to the list
const outputUsers = (users) => {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
};
