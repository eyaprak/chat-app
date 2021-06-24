(function () {


    var element = function (id) {
        return document.getElementById(id);
    }

    // Get Elements
    var title = element('title')
    var messages = element('messages')
    var msg = element('msg')
    var chatForm = element('chat-form')
    var username = element('username')
    var objDiv = element('messages')
    username = username.innerHTML

    var messageLenght = $('.message').length
    let text = messageLenght > 0 ? '.message:last-child' : '.messages'


    //Set default status
    var statusDefault = title.textContent;

    var setStatus = (s) => {

        title.textContent = s

        if (s !== statusDefault) {
            title.setAttribute('class', 'title success-text')
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000);
            setTimeout(function () {
                title.classList.remove('success-text')
            }, 4000)

        }
    }

    //Connect to socket.io
    var socket = io.connect()





    let divFloat, dataLoad = 0, name, msgSent = 0;

    //Check connection
    if (socket !== undefined) {
        console.log("connected to socket")

        socket.emit('joinRoom', username.trim());
        socket.emit('disconnectUser', username.trim());

        socket.on('output', (data) => {


            if (data.length) {
                for (var x = 0; x < data.length; x++) {


                    //Build out message div
                    var message = document.createElement('li');
                    var divAvatar = document.createElement('div')
                    var divTextWrapper = document.createElement('div')
                    var divMessage = document.createElement('div')
                    var divName = document.createElement('div')
                    var divText = document.createElement('div')
                    var divTime = document.createElement('div')

                    var date = new Date(data[x].sentTime)
                    var localDate = date.toLocaleString()

                    if (username.trim() == data[x].name) {
                        divFloat = 'right';
                    } else {
                        divFloat = 'left';
                    }

                    message.setAttribute('class', `message ${divFloat} appeared`)
                    divAvatar.setAttribute('class', 'avatar')
                    divTextWrapper.setAttribute('class', 'text_wrapper')
                    divName.setAttribute('class', 'name')
                    divText.setAttribute('class', 'text')
                    message.appendChild(divAvatar)

                    message.appendChild(divTextWrapper)
                    divTextWrapper.appendChild(divMessage)
                    divMessage.setAttribute('class', `div-message ${divFloat}`)
                    divMessage.appendChild(divName)
                    divName.textContent = data[x].name
                    divMessage.appendChild(divText)
                    divText.textContent = data[x].message

                    divTime.setAttribute('class', `time ${divFloat}`)
                    divTextWrapper.appendChild(divTime)
                    divTime.textContent = localDate

                    messages.appendChild(message)
                    messages.insertBefore(message, messages.lastChild)

                    let avatarText = (data[x].name).slice(0, 2);
                    $('.message:last-child>.avatar').append("<span class='avatar-text-" + divFloat + "'>" + avatarText.toUpperCase() + "</span>")


                }
                dataLoad = 1;
                var objDiv = element('messages')
                objDiv.scrollTop = objDiv.scrollHeight;

            }
        });



        //Get Status from server
        socket.on('status', (data) => {
            //get message status
            setStatus((typeof data === 'object') ? data.message : data)

            // If status is clear, clear text
            if (data.clear) {
                msg.value = '';
            }
        });




        chatForm.addEventListener('submit', (e) => {
            var divClass = $('.messages>.message').last().attr('class')
            var checkLastUsername = $('.messages>.message:last-child>.text_wrapper>.div-message>.name').text()
            if (divClass == "" || typeof divClass === undefined || divClass == null) {
                divFloat = 'left';
            } else {
                if (username.trim() == checkLastUsername.trim()) {
                    msgSent = 1;
                    if (divClass.indexOf('left') > 0) {
                        divFloat = 'left';
                    } else {
                        divFloat = 'right';
                    }
                } else {
                    msgSent = 1;
                    if (divClass.indexOf('left') > 0) {
                        divFloat = 'right';
                    } else {
                        divFloat = 'left';
                    }
                }
            }


            date = new Date()
            let sendDate = date.getTime()
            socket.emit('input', {
                name: username.trim(),
                message: msg.value,
                sentTime: sendDate
            });



            e.preventDefault();
            objDiv.scrollTop = objDiv.scrollHeight;
            $('#msg').val('')


        })


        socket.on('roomMessage', (message) => {
            if (messageLenght > 0) {
                $(text).after("<li class='message left appeared'><div class='text_wrapper'>" + message + "</div></li>")
            } else {
                $(text).append("<li class='message left appeared'><div class='text_wrapper'>" + message + "</div></li>")
            }
            socket.on('joinRoomSound', () => {
                let joinChatSound = document.getElementById("joinChatSound")
                if (!joinChatSound.muted) {
                    joinChatSound.play();
                    joinChatSound.muted = false;
                }
            })

            objDiv.scrollTop = objDiv.scrollHeight;
        });
        socket.on('roomUsers', ({ users }) => {
            $('.list-group').html('')
            users.forEach(user => {
                $('.list-group').append("<li class='list-group-item'><i class='fas fa-circle'></i><span class='online-user-text'> " + user.username + "</span></li>")
            })
        });





        $('.clear-msg').on('click', (e) => {
            socket.emit('clear')
            e.preventDefault()
            $('.message').remove()
            $('.messages').append("<li class='message left appeared'><div class='text_wrapper'>Chat has been cleaned.</div></li>")
            $('.online-users-cart').hide("slide");
        })

        socket.on('cleared', () => {
            $('.message').remove()
            $('.messages').append("<li class='message left appeared'><div class='text_wrapper'>Chat has been cleaned.</div></li>")
            $('.online-users-cart').hide("slide");
        })

        $('.open-panel>span, .close-cross, .show-online-users, .online-users-shadow ').on('click', () => {
            $('.online-users-cart').toggle("slide");
        })

        $('.logout-button').on('click', () => {
            if (confirm('Do you want to leave the chat?')) {
                window.location = '/logout'
            }
        })

        socket.on('playMessageSound', () => {
            document.getElementById("messageSound").play();
        })



        $('#open-sound').on('click', () => {
            let joinChatAudio = document.getElementById("joinChatSound");
            let messageSound = document.getElementById("messageSound");

            let vibrationSound = document.getElementById("vibrationSound");
            joinChatAudio.volume = 1;
            messageSound.volume = 1;
            vibrationSound.volume = 1;
            vibrationSound.muted = false;
            joinChatAudio.muted = false;
            messageSound.muted = false;
            $('#open-sound').hide()
            $('#mute-sound').show()
        })
        $('#mute-sound').on('click', () => {
            let joinChatAudio = document.getElementById("joinChatSound");
            let messageSound = document.getElementById("messageSound");
            let vibrationSound = document.getElementById("vibrationSound");
            joinChatAudio.volume = 0;
            messageSound.volume = 0;
            vibrationSound.volume = 0;
            joinChatAudio.muted = true;
            messageSound.muted = true;
            vibrationSound.muted = true;
            $('#open-sound').show()
            $('#mute-sound').hide()

        })

    }



    $('#vibration-button').on('click', () => {
        socket.emit('shakedUser', username.trim())

        if (messageLenght > 0) {
            $(text).after("<li class='message right appeared'><div class='text_wrapper'>You shacked the chat window</div></li>")
        } else {
            $(text).append("<li class='message right appeared'><div class='text_wrapper'>You shacked the chat window</div></li>")
        }
        //$('#chat_window').addClass('animate__animated animate__shakeX')
        $('#vibration-button').attr("disabled", true)
        
        setTimeout(() => {
          //  $('#chat_window').removeClass('animate__animated animate__shakeX')
            $('#vibration-button').attr("disabled", false)
        }, 2000)

        objDiv.scrollTop = objDiv.scrollHeight;


    })

    socket.on('shakeChat', (msg) => {
        if (messageLenght > 0) {
            $(text).after("<li class='message left appeared'><div class='text_wrapper'>" + msg + "</div></li>")
        } else {
            $(text).append("<li class='message left appeared'><div class='text_wrapper'>" + msg + "</div></li>")
        }
        
        $('#chat_window').addClass('animate__animated animate__shakeX')
        setTimeout(() => {
            $('#chat_window').removeClass('animate__animated animate__shakeX')
        }, 2000)
        
        objDiv.scrollTop = objDiv.scrollHeight;
        document.getElementById("vibrationSound").play();
    })

    document.getElementById("joinChatSound").muted = true;
    document.getElementById("messageSound").muted = true;
    document.getElementById("vibrationSound").muted = true;
    $('#mute-sound').hide()
    /*
    $('#chat_window').addClass('animate__animated animate__shakeX')
    
    */

})();
