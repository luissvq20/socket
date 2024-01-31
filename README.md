# socket
## Ejercicio 1: Implementación Básica de Socket.io con Express
Configura un servidor Node.js con Express y Socket.io. Crea una conexión básica de Socket.io y emite un mensaje cuando un nuevo cliente se conecta.
Primero hay que instalar los paquetes necesarios `
```
npm install express@4
```
```
npm install express -save
```
```
npm install socker.io
```
 app.js:
 ```
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('welcome', { message: 'Hola' });


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
```
index.html:
```
<!DOCTYPE html>
<html>
<head>
  <title>Ejemplo de Socket.io</title>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    socket.on('welcome', (data) => {
      console.log(data.message);
    });
  </script>
</head>
<body>
  <p>Hola</p>
</body>
</html>
```

## Ejercicio 2: Comunicación Bidireccional con Socket.io
Amplía el ejercicio anterior para permitir la comunicación bidireccional. Crea un evento en el cliente para enviar mensajes al servidor y un evento en el servidor para retransmitir esos mensajes a todos los clientes.
app.js:
```
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');
  socket.emit('nuevo-mensaje', { mensaje: 'CHAT' });

  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });

  socket.on('mensaje', (data) => {
    io.emit('nuevo-mensaje', { mensaje: data.mensaje });
    console.log('Mensaje recibido: ' + data.mensaje);
  });
});

http.listen(3000, () => {
  console.log('Escuchando en el puerto 3000');
});
```
index.html:
```
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat</title>
  <style>
    /* Add some basic styling */
    body { font-family: Arial, sans-serif; }
    ul { list-style-type: none; margin: 0; padding: 0; }
    li { margin-bottom: 10px; }
  </style>
</head>
<body>
  <ul id="mensajes"></ul>
  <form id="mensaje-form">
    <input type="text" id="mensaje-input" autocomplete="off" /><button>Enviar</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    // Listen for welcome message
    socket.on('nuevo-mensaje', (data) => {
      const li = document.createElement('li');
      li.textContent = data.mensaje;
      document.getElementById('mensajes').appendChild(li);
    });

    // Send a message
    document.getElementById('mensaje-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (document.getElementById('mensaje-input').value) {
        socket.emit('mensaje', { mensaje: document.getElementById('mensaje-input').value });
        document.getElementById('mensaje-input').value = '';
      }
    });
  </script>
</body>
</html>
```
 
## Ejercicio 3: Sala de Chat con Socket.io
Implementa una sala de chat simple utilizando Socket.io. Permite que los clientes ingresen un nombre de usuario y envíen mensajes que se mostrarán a todos los usuarios conectados.
app.js:
```
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  // Escuchar el evento 'message' del cliente
  socket.on('message', (data) => {
    console.log('Mensaje recibido:', data);

    // Emitir el evento 'message' al resto de clientes
    io.emit('message', data);
  });

  // Emitir el evento 'welcome' al cliente
  socket.emit('welcome', { username: 'Anónimo' });
});

http.listen(3000, () => {
  console.log('Escuchando en el puerto 3000');
});
```
 index.html:
 ```
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Simple con Socket.io</title>
  <style>
    #messages {
      height: 300px;
      overflow-y: scroll;
      border: 1px solid black;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <form id="message-form">
    <input type="text" id="username" placeholder="Nombre de usuario" required>
    <input type="text" id="message" placeholder="Mensaje" required>
    <button type="submit">Enviar</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    // Escuchar el evento 'welcome' del servidor
    socket.on('welcome', (data) => {
      console.log('Bienvenido:', data.username);
    });

    // Escuchar el evento 'message' del servidor
    socket.on('message', (data) => {
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('p');
      messageElement.textContent = `${data.username}: ${data.message}`;
      messagesDiv.appendChild(messageElement);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Enviar el formulario para enviar mensajes
    document.getElementById('message-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const message = document.getElementById('message').value;

      // Enviar el mensaje al servidor
      socket.emit('message', { username, message });

      // Limpiar el formulario
      document.getElementById('username').value = '';
      document.getElementById('message').value = '';
    });
  </script>
</body>
</html>
```
## Ejercicio 4: Seguimiento de Usuarios Conectados
Implementa una función para realizar un seguimiento de los usuarios conectados y enviar la lista actualizada a todos los clientes cada vez que alguien se une o sale del chat.
app.js:
```
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Broadcast when a user joins the chat
  socket.broadcast.emit('message', { user: 'Admin', text: `${socket.id} has joined the chat` });

  // Listen for new users
  socket.on('new user', (username) => {
    users.push(username);
    socket.username = username;
    io.emit('update users', users);
    io.emit('message', { user: 'Admin', text: `${username} has joined the chat` });
  });

  // Listen for messages
  socket.on('send message', (msg) => {
    io.emit('message', { user: socket.username, text: msg });
  });

  // Listen for disconnect
  socket.on('disconnect', () => {
    users = users.filter(user => user !== socket.username);
    io.emit('update users', users);
    io.emit('message', { user: 'Admin', text: `${socket.username} has left the chat` });
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
```
index.html:
```
<!DOCTYPE html>
<html>
<head>
  <title>Simple Chat Room</title>
  <style>
    #messages {
      height: 300px;
      overflow-y: scroll;
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <form id="message-form">
    <input type="text" id="username" placeholder="Enter your username" required />
    <input type="text" id="message" placeholder="Enter your message" required />
    <button type="submit">Send</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    // Display incoming messages
    socket.on('message', (msg) => {
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('p');
      messageElement.textContent = `${msg.user}: ${msg.text}`;
      messagesDiv.appendChild(messageElement);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Display updated list of users
    socket.on('update users', (users) => {
      const usersDiv = document.getElementById('users');
      usersDiv.innerHTML = '';
      users.forEach((user) => {
        const userElement = document.createElement('p');
        userElement.textContent = user;
        usersDiv.appendChild(userElement);
      });
    });

    // Send new user
    document.getElementById('message-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const message = document.getElementById('message').value;

      // Send new user to server
      socket.emit('new user', username);

      // Send message to server
      socket.emit('send message', message);

      // Clear input fields
      document.getElementById('username').value = '';
      document.getElementById('message').value = '';
    });
  </script>
</body>
</html>
```
## Ejercicio 5: Mensajes Privados con Socket.io
Agrega la capacidad de enviar mensajes privados entre usuarios. Crea un evento para manejar los mensajes privados y actualiza la interfaz del cliente para mostrarlos.
app.js
```
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Broadcast when a user joins the chat
  socket.broadcast.emit('message', { user: 'Admin', text: `${socket.id} has joined the chat` });

  // Listen for new users
  socket.on('new user', (username) => {
    users.push({ id: socket.id, username });
    socket.username = username;
    io.emit('update users', users.map(user => user.username));
    io.emit('message', { user: 'Admin', text: `${username} has joined the chat` });
  });

  // Listen for messages
  socket.on('send message', (msg) => {
    io.emit('message', { user: socket.username, text: msg });
  });

  // Listen for private messages
  socket.on('private message', ({ recipient, message }) => {
    const recipientSocket = users.find(user => user.username === recipient)?.id;
    if (recipientSocket) {
      io.to(recipientSocket).emit('private message', { sender: socket.username, message });
    } else {
      // Handle the case where the recipient is not found
      // You may want to emit an error or handle it differently
      console.log(`Recipient ${recipient} not found`);
    }
  });

  // Listen for disconnect
  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    io.emit('update users', users.map(user => user.username));
    io.emit('message', { user: 'Admin', text: `${socket.username} has left the chat` });
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
```

index.html:
```
<!DOCTYPE html>
<html>
<head>
  <title>Simple Chat Room</title>
  <style>
    #messages {
      height: 300px;
      overflow-y: scroll;
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <div id="users"></div>
  <form id="message-form">
    <input type="text" id="username" placeholder="Enter your username" required />
    <input type="text" id="message" placeholder="Enter your message" required />
    <button type="submit">Send</button>
  </form>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    // Display incoming messages
    socket.on('message', (msg) => {
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('p');
      messageElement.textContent = `${msg.user}: ${msg.text}`;
      messagesDiv.appendChild(messageElement);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Display updated list of users
    socket.on('update users', (users) => {
      const usersDiv = document.getElementById('users');
      usersDiv.innerHTML = '';
      users.forEach((user) => {
        const userElement = document.createElement('p');
        userElement.textContent = user;
        usersDiv.appendChild(userElement);
      });
    });

    // Display private messages
    socket.on('private message', (data) => {
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('p');
      messageElement.textContent = `(Private) ${data.sender} to ${socket.username}: ${data.message}`;
      messagesDiv.appendChild(messageElement);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Send new user and message
    document.getElementById('message-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const message = document.getElementById('message').value;

      // Send new user to server
      socket.emit('new user', username);

      // Send message to server
      socket.emit('send message', message);

      // Clear input fields
      document.getElementById('username').value = '';
      document.getElementById('message').value = '';
    });

    // Function to send private message
    function sendPrivateMessage() {
      const recipient = prompt('Enter recipient username:');
      const message = prompt('Enter your private message:');
      socket.emit('private message', { recipient, message });
    }
  </script>
  <button onclick="sendPrivateMessage()">Send Private Message</button>
</body>
</html>
```
