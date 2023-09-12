const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const showChat = document.querySelector("#showChat");
showChat.addEventListener("click", function() {
  document.querySelector(".main-right").classList.toggle("right");
  document.querySelector(".main-left").classList.toggle("fullDisplay");
  showChat.classList.toggle("color");
});
const user = prompt("Enter your name");
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
let myVideoStream;
const myVideo = document.createElement('video')
const myscreen = document.createElement('video')
myscreen.setAttribute("id", "screenshare");
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', RoomId, id, user)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 8) {
    document.getElementsByTagName("video").style.height = "200px";
    document.getElementsByTagName("video").style.width = "200px";
  }
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

document.querySelector('.main__mute_button').addEventListener("click", function() {
  document.querySelector('.main__mute_button').classList.toggle("color");
});

document.querySelector('.main__video_button').addEventListener("click", function() {
  document.querySelector('.main__video_button').classList.toggle("color");
});

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
const inviteButton = document.querySelector("#invitebtn");
inviteButton.addEventListener("click", function(e) {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
const stopButton = document.querySelector("#stopButton").addEventListener("click", function() {
  var ans = confirm("Are you sure you want to quit?");
  if (ans === true) {
    window.close();
  }
});

const text = document.querySelector("#chat_message");
const send = document.querySelector("#send");
const messages_m = document.querySelector(".messages");
send.addEventListener("click", () => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    messages_m.innerHTML = messages_m.innerHTML +
      `<div class="message_card">
             <p class="bold">Me:</p>
             <p class="textmsg bold">${text.value}</p></div>`;
    text.value = "";
  }
})
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit('message', RoomId, text.value, user);
    messages_m.innerHTML = messages_m.innerHTML + `<div class="message_card">
  <p class="bold">Me:</p>
<p class="textmsg bold">${text.value}</p>
         </div>`;
    text.value = "";
  }
});

socket.on("createMessage", (message, username) => {
  messages_m.innerHTML =
    messages_m.innerHTML +
    `<div class="message_card">
             <p class="bold"> ${username}:</p>
             <p class="textmsg bold">${message}</p>
         </div>`;

})

let ss = document.querySelector("#screensharebtn");
let toggle = false;
ss.addEventListener("click", () => {
  if (toggle) {
    toggle = !toggle
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      }
    }).then(stream => {
      myVideoStream = stream;
      addVideoStream(myscreen, stream)
      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })
      socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })
    })
  } else {
    toggle=!toggle
     let p=document.querySelector("#screenshare")
     p.parentNode.removeChild(p);

  }
})
