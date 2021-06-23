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





            //console.log(data)
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


                //console.log($('.messages>.message').last().attr('class'))
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
            $('#btn-send').on('click', function () {
                socket.on('playMessageSound', () => {
                    document.getElementById("myAudio").play();
                })
            });


        })


        socket.on('roomMessage', (message) => {
            $('.message:last-child').after("<li class='message left appeared'><div class='text_wrapper'>" + message + "</div></li>")
            objDiv.scrollTop = objDiv.scrollHeight;
        });
        socket.on('roomUsers', ({ users }) => {
            $('.list-group').html('')
            users.forEach(user => {
                $('.list-group').append("<li class='list-group-item'><i class='fas fa-circle'></i><span class='online-user-text'> " + user.username + "</span></li>")
            })
        });


    }


})();
