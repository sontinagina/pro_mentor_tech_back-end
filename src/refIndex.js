

var http = require('http');
var url = require('url');
http.createServer(function(req,res){
  res.writeHead(201,{'content-type':'text/html'});
  console.log("server startd")
var q = url.parse(req.url, true);
console.log(q.query.name)
  console.log(req.url)
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  })
  req.on('end', () => {
    console.log(JSON.parse(data).todo); // 'Buy the milk'
    res.end();
  })    
  if(req.url==="/gandinagi"){
  res.end('gandi nagi callex')
  }else{
    res.end('hello world no gandi nagi nagina bai kumari')
  }
}).listen(8080);