const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const scriptFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));
const styleFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));
const registerFile = fs.readFileSync(path.join(__dirname, 'static', 'register.html'));
const registerStyleFile = fs.readFileSync(path.join(__dirname, 'static', 'register.css'));
const authFile = fs.readFileSync(path.join(__dirname, 'static', 'auth.js'));
const loginFile = fs.readFileSync(path.join(__dirname, 'static', 'login.html'));

const PORT = proccess.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if(req.method === 'GET'){
    switch(req.url) {
      
        case '/': return res.end(indexHtmlFile);
        res.writeHead(200, {
        'Content-type': 'text/html'
      });
        case '/script.js': return res.end(scriptFile);
        res.writeHead(200, {
        'Content-type': 'text/javascript'
      });
        case '/style.css': return res.end(styleFile);
       res.writeHead(200, {
        'Content-type': 'text/css'
      });
        case '/register': return res.end(registerFile);
        res.writeHead(200, {
        'Content-type': 'text/html'
      });
        
        case '/register.css': return res.end(registerStyleFile);
        res.writeHead(200, {
        'Content-type': 'text/css'
      });
        case '/auth.js': return res.end(authFile);
        res.writeHead(200, {
        'Content-type': 'text/javascript'
      });
        case '/login': return res.end(loginFile);
        res.writeHead(200, {
        'Content-type': 'text/html'
      });
      }
    
  }
  if(req.method === 'POST'){
    switch (req.url) {
      case '/register': return registerUser(req.res)

    }
  }
    return res.end('Error 404');
});
function registerUser(req, res){
    let data = ''
    req.on('data', (chunk)=>{
      data+=chunk
    })
    req.on('end', async()=>{
      // console.log(data)
      try{
        const user = JSON.parse(data)
        if(!user.login || !user.password) return res.end('no login or password')
          if(await db.isUserExists(user.login)) return res.end('such user already exists')
        await db.addUser(user)
      return res.end('auth success')
          }

      catch(e){
        return res.end(`error ${e}`)
      }
    })
}

server.listen(PORT, '0.0.0.0',()=>{
  console.log(`Running on ${PORT}`)
});

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', async (socket) => {
  console.log('a user connected. id - ' + socket.id);

  let userNickname = 'admin';
  let messages = await db.getMessages();

  socket.emit('all_messages', messages);

  socket.on('new_message', (message) => {
    db.addMessage(message, 1);
    io.emit('message', userNickname + ' : ' + message);
  });
});

